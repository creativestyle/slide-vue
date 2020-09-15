module.exports = {
    env: {
			browser: true,
			es2021: true
    },
    extends: [
			'eslint:recommended',
			'plugin:vue/essential',
			'plugin:vue/vue3-recommended',
			'airbnb-base'
    ],
    parserOptions: {
			ecmaVersion: 12,
			sourceType: 'module'
    },
    plugins: [
      'vue'
    ],
    rules: {
			indent: 'off',
			'no-useless-escape': 'off',
			'vue/script-indent': ['error', 2, {
			baseIndent: 1,
			switchCase: 1
			}],
			'vue/html-self-closing': ['error', {
			html: {
					void: 'always',
					normal: 'never',
					component: 'always'
			},
			svg: 'always',
			math: 'always'
			}],
			'vue/require-default-prop': 'off',
			'vue/require-prop-types': 'off',
			'vue/no-v-html': 'off',
			'vue/name-property-casing': ['error', 'kebab-case'],
			'vue/no-use-v-if-with-v-for': ['error', {
			allowUsingIterationVar: true
			}],
			'vue/singleline-html-element-content-newline': 'off',
			'comma-dangle': 'off',
			'arrow-parens': 'off',
			'no-plusplus': 'off',
			'max-len': 'off',
			'no-param-reassign': ['error', { props: false }],
			'prefer-destructuring': ['error', { object: true, array: false }],
			'no-var': 'off',
			'no-unused-expressions': [2, { allowTernary: true }],
			'default-case': 'off',
			'no-bitwise': 'off',
			'no-lonely-if': 'off',
			'no-mixed-operators': 'off',
			'no-new': 'off',
			'func-names': 'off',
			'class-methods-use-this': 'off',
			'prefer-template': 'off',
			'no-else-return': 'off',
			'no-underscore-dangle': ['error', { allow: ['_observer', '_windowResizeHandler'] }],
			'no-script-url': 'off',
			'no-continue': 'off',
			'no-tabs': 'off',
			'vue/component-definition-name-casing': ['error', 'kebab-case']
    }
};
