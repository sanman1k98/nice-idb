import antfu from '@antfu/eslint-config';

const base = antfu({
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

export default base
	.append({
		name: 'user/generated/ignores',
		ignores: ['./types/'],
	});
