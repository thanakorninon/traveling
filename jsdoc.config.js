module.exports = {
  tags: {
    allowUnknownTags: true,
    dictionaries: ['jsdoc', 'closure']
  },
  source: {
    include: ['js'],
    includePattern: '.+\\.js$',
    excludePattern: '(node_modules/|docs)'
  },
  plugins: ['plugins/markdown'],
  templates: {
    cleverLinks: false,
    monospaceLinks: false,
    default: {
      outputSourceFiles: true
    }
  },
  opts: {
    destination: './docs',
    recurse: true,
    readme: './README.md'
  }
}; 