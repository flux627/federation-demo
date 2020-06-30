const chalk = require('chalk')
const groupBy = require('lodash.groupby')
const { diff } = require('@graphql-inspector/core')

const validateSchemaCoverage = (targetSchema, schema) => {
  console.warn('Validating schema matches target schema...')
  const schemaDiff = getSchemaDiff(targetSchema, schema)

  if (Object.keys(schemaDiff).length) {
    logSchemaDiff(schemaDiff)
    return false
  } else {
    console.warn('Schema matches target.')
    return true
  }
}

const getSchemaDiff = (targetSchema, actualSchema) => {
  const schemaDiff = diff(targetSchema, actualSchema)

  const filteredSchemaDiff = schemaDiff.filter((change) => {
    if (change.type === 'TYPE_DESCRIPTION_CHANGED') return false
    if (change.type === 'TYPE_DESCRIPTION_ADDED') return false
    if (change.type === 'DIRECTIVE_REMOVED' && change.path === '@cacheControl') return false
    if (change.type === 'TYPE_REMOVED' && change.path === 'CacheControlScope') return false
    return true
  })

  const schemaDiffWithParentType = filteredSchemaDiff.map((item) => {
    let parentType = item.path.split('.').slice(0, -1)[0]
    if (!parentType) {
      parentType = '[Missing Types]'
    }
    return { ...item, parentType }
  })

  const groupedByParentType = groupBy(schemaDiffWithParentType, 'parentType')

  const groupedByChangeType = Object.fromEntries(
    Object.entries(groupedByParentType).map(([key, value]) => {
      return [key, groupBy(value, 'type')]
    }),
  )

  return groupedByChangeType
}

const logSchemaDiff = (schemaDiff) => {
  const toLog = [
    '',
    chalk.red.bold('Generated schema does not match target schema!'),
    'The following differences were found:',
    '',
  ]

  for (const [objectType, changesByName] of Object.entries(schemaDiff)) {
    if (objectType[0] === '[') {
      toLog.push(chalk.white.bold(objectType))
    } else {
      toLog.push(chalk.cyan.bold(objectType))
    }
    for (const changes of Object.values(changesByName)) {
      for (const change of changes) {
        toLog.push(`  ${getChangeEmoji(change.message)} ${updateTense(change.message)}`)
      }
    }
    toLog.push('')
  }
  console.error(toLog.join('\n'))
}

const getChangeEmoji = (changeMessage) => {
  if (changeMessage.includes('removed')) {
    return chalk.red.bold('✖')
  }
  if (changeMessage.includes('added')) {
    return chalk.green.bold('✚')
  }
  if (changeMessage.includes('changed')) {
    return chalk.yellow.bold('Δ')
  }
  return chalk.white.bold('?')
}

const updateTense = (changeMessage) => {
  if (changeMessage.includes('was removed')) {
    return changeMessage.replace('was removed', 'is missing')
  }

  if (changeMessage.includes('changed type from') && changeMessage.includes(`' to '`)) {
    return changeMessage
      .replace('changed type from', 'should be type')
      .replace(`' to '`, `' but is currently '`)
  }

  if (changeMessage.includes('changed from') && changeMessage.includes(`' to '`)) {
    return changeMessage
      .replace('changed from', 'should be')
      .replace(`' to '`, `' but is currently '`)
  }

  if (changeMessage.includes('was added to')) {
    return changeMessage.replace('was added to', 'should not exist on')
  }
  return changeMessage
}

module.exports = {
  validateSchemaCoverage,
}
