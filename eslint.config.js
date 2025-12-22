import antfu from '@antfu/eslint-config';

export default antfu({
	type: 'lib',
	typescript: true,
	stylistic: {
		indent: 'tab',
		semi: true,
		quotes: 'single',
		overrides: {
			'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
		},
	},
});
