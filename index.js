var balanced = require('balanced-match')
var debug = require('debug')('aggsy')

var leading = /^[\s,]+/
var findName = /^[\w.]+(?=:)/

var defaultReducers = require('./reducers')

function aggsy (query, data, options) {
  query = query.replace(/"/g,'')
  debug(query)
  if (!Array.isArray(data)) {
    options = data
    data = undefined
  }


  options = options || {}

  var reducers = options.reducers || defaultReducers
  if (options.reducers) {
    for (var n in defaultReducers) {
      if (!reducers[n]) reducers[n] = defaultReducers[n]
    }
  }

  var reducersText = Object.keys(reducers).map((name) => {
    if (typeof reducers[name] !== 'function') { throw new Error('reducers must be functions') }
    if (query.indexOf(name) !== -1) {
      return `var ${name} = ${reducers[name].toString()}`
    }
    return false
  }).filter(Boolean).join('\n')


  const ast = parse({ reducers }, query, options)
  if (ast.options) {
    options = Object.assign(ast.options)
  } 
  debug(JSON.stringify(ast, null, 2))

  var funcText = `
/** Add used reducers */
${reducersText}

const _tmp = {}

/** Create the iterator function */
return function (result, item) {
  ${genFunction(ast, options)}
}
`
  debug(funcText)
  var createFunction = new Function (funcText) // eslint-disable-line
  var func = createFunction()

  if (!data) {
    return func
  }

  var result = {}

  for (var i = 0; i < data.length; i++) {
    func(result, data[i])
  }

  if (options.flatten) return resolveFlatStructure(result)

  return result
}

function propPath (name, path) {
  var parts = path.split('.')
  return Array(parts.length).join('(') + name + '["' + parts.join('"] || false)["') + '"]'
}
// create lookup path into the result structure
function createPath (prefix, path, options) {
  if (!path || !path.length) return prefix
  if (options.flatten) {
    const parts = path.map((part, index) => {
      if (index === 0) return `${part.slice(0, -1)}.'`
      if (index % 2) return part
      return `'.${part.slice(1, -1)}.'`
    }) 
    return `${prefix}[${parts.join('+')}]`
  }
  return `${prefix}[${path.join('][')}]`
}

function genFunction ({ name, id, groups, reducers}, options, parentPath) {
  path = parentPath || []
  const leaf = options.flatten && !groups.length
  if (id) {
    var prop = 'group' + id
    path = path.concat(options.showGroups || options.flatten ? [`'${name}'`, prop] : prop)
  }
  let func = ''
  const resultObject = !options.flatten || leaf ? 'result' : '_tmp'
  const resultProp = createPath(resultObject, path, options)
  if (name) {
    func += `\n/** GROUP: ${name} */\n`
    func += `var ${prop} = ${propPath('item', name)}\n`
    
    if (!options.missing) func += `if (typeof ${prop} !== 'undefined') {\n`
    else func += `if (typeof ${prop} === 'undefined') ${prop} = '${options.missing}';\n`

    if (options.showGroups && path.length > 1) {
      func += ensureExist(createPath('result', path, options))
    }
    
    if (!groups.length && !reducers.length) {
      // no reducers or groups defined return all items in grouping
      func += ensureExist(resultProp, '[]') 
      func += `${resultProp}.push(item)\n`
    } else {
      // reducers or groups defined
      let newObject = '{}'
      if (options.flatten && path.length > 2) {
        newObject = `Object.create(${createPath('_tmp', parentPath, options)})`
      }
      func += ensureExist(resultProp, newObject)
      if (options.flatten) func += `${resultProp}['${name}'] = ${prop}\n`
    }
  }
  
  reducers.forEach((reducer) => {
    const reducerProp = `${resultProp}['${reducer.as}']`
    const itemProp = reducer.body ? propPath('item', reducer.body) : undefined

    func += '\n/** REDUCER: ' + reducer.as + ' */\n'
    func += `if (typeof ${reducerProp}  === 'undefined') `
    if (typeof reducer.initialValue !== 'undefined') {
      func += `${reducerProp} = ${reducer.name}(${JSON.stringify(reducer.initialValue)}${itemProp ? `, ${itemProp}` : ''})\n`
    } else if (itemProp) {
      func += `${reducerProp} = ${itemProp}\n`
    }

    func += `else ${reducerProp} = ${reducer.name}(${reducerProp}${itemProp ? `, ${itemProp}` : ''})\n`
  })

  groups.forEach(group => {
    func += genFunction(group, options, path)
  })
  
  if (name) {
    if (!options.missing) func += '}\n'
    func += `/** END-GROUP: ${name} */\n`
  }

  return func 
}

function parse (state, agg, options, ast) {
  ast = ast || { groups: [], reducers: [] }
  const reducers = state.reducers

  const parsed = balanced('(', ')', agg)
  if (!parsed) {
    throw new Error('aggsy query faulty. check if used reducers are defined')
  }

  let pre = parsed.pre.replace(leading, '')

  // if named function remove name
  let as = findName.exec(pre)
  if (as) {
    as = as[0]
    pre = pre.substring(as.length + 1).trim()
  }

  if (pre === '_flatten') {
    ast.options = { flatten: true }
    options = Object.assign({}, { flatten: true })
    if (parsed.body) parse(state, parsed.body, options, ast)
    if (parsed.post) parse(state, parsed.post, options, ast)
  } else if (reducers[pre]) {
    if (!as) as = pre + '(' + parsed.body + ')'
    ast.reducers.push({
      name: pre, 
      initialValue: reducers[pre].initialValue,
      as,
      body: parsed.body
    })
    
    if (parsed.post) parse(state, parsed.post, options, ast) 
  } else {
    state.currentGroupId = (state.currentGroupId || 0) + 1
    const group = { name: pre, id: state.currentGroupId, groups: [], reducers: [] }
    ast.groups.push(group)
    if (parsed.body) parse(state, parsed.body, options, group)
    if (parsed.post) parse(state, parsed.post, options, ast)
  }

  return ast
}

function ensureExist (path, set) {
  return `if (typeof ${path} === 'undefined') ${path} = ${set || '{}'}\n`
}

function resolveFlatStructure (structure) {
  const resolved = []
  // we want to change it from an object to an array
  for (let key in structure) {
    const obj = {}
    // we also need to resolve the prototype chain
    for (let prop in structure[key]) {
      obj[prop] = structure[key][prop]
    }
    resolved.push(obj)
  }
  return resolved
}

aggsy.parse = parse

module.exports = aggsy
