import antfu from '@antfu/eslint-config';

const base = antfu({
	type: 'lib',
	typescript: true,
	stylistic: {
		indent: 'tab',
		semi: true,
		quotes: 'single',
	},
});

export default base
	.override('antfu/stylistic/rules', {
		rules: {
			'style/brace-style': ['error', '1tbs', { allowSingleLine: true }],
		},
	})
	.override('antfu/jsdoc/rules', {
		rules: {
			'jsdoc/require-returns-description': ['off'],
		},
	})
	.append({
		name: 'user/generated/ignores',
		ignores: ['./types/'],
	});
