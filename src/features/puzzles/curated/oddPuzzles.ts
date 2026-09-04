import type { MultipleChoicePuzzle, Puzzle } from '../types'

function mc(params: {
	id: string
	difficulty: 1 | 2 | 3 | 4 | 5
	prompt: string
	options: { id: string; label: string }[]
	answer: string
	hints: { level: 1 | 2; text: string }[]
	explanation: string
}): MultipleChoicePuzzle {
	return {
		id: params.id,
		type: 'curated.multiple_choice',
		category: 'odd_one_out',
		difficulty: params.difficulty,
		prompt: params.prompt,
		interactionType: 'multiple_choice',
		options: params.options,
		answer: params.answer,
		hints: params.hints,
		explanation: params.explanation,
		seed: 0,
		metadata: {
			generatorId: 'curated.library',
			generatorVersion: 1,
			tags: ['curated', 'odd_one_out'],
		},
	}
}

/** Small curated odd-one-out set (words). Numbers come from the generator. */
export const CURATED_ODD_PUZZLES: Puzzle[] = [
	mc({
		id: 'curated.odd.colors-word',
		difficulty: 1,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'Красный' },
			{ id: 'b', label: 'Синий' },
			{ id: 'c', label: 'Зелёный' },
			{ id: 'd', label: 'Стол' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Три слова — названия цветов.' },
			{ level: 2, text: '«Стол» — предмет, а не цвет.' },
		],
		explanation:
			'Красный, синий и зелёный — цвета. «Стол» — предмет мебели.',
	}),
	mc({
		id: 'curated.odd.animals',
		difficulty: 1,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'Кот' },
			{ id: 'b', label: 'Собака' },
			{ id: 'c', label: 'Воробей' },
			{ id: 'd', label: 'Лошадь' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Кто из них не млекопитающее?' },
			{ level: 2, text: 'Воробей — птица.' },
		],
		explanation: 'Кот, собака и лошадь — млекопитающие. Воробей — птица.',
	}),
	mc({
		id: 'curated.odd.transport',
		difficulty: 2,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'Автобус' },
			{ id: 'b', label: 'Трамвай' },
			{ id: 'c', label: 'Метро' },
			{ id: 'd', label: 'Диван' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Три слова — про транспорт.' },
			{ level: 2, text: 'Диван — мебель.' },
		],
		explanation: 'Автобус, трамвай и метро — транспорт. Диван — мебель.',
	}),
	mc({
		id: 'curated.odd.seasons',
		difficulty: 1,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'Весна' },
			{ id: 'b', label: 'Лето' },
			{ id: 'c', label: 'Осень' },
			{ id: 'd', label: 'Понедельник' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Три слова — времена года.' },
			{ level: 2, text: 'Понедельник — день недели.' },
		],
		explanation: 'Весна, лето и осень — времена года. Понедельник — день недели.',
	}),
	mc({
		id: 'curated.odd.instruments',
		difficulty: 2,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'Гитара' },
			{ id: 'b', label: 'Скрипка' },
			{ id: 'c', label: 'Барабан' },
			{ id: 'd', label: 'Карандаш' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Три слова — музыкальные инструменты.' },
			{ level: 2, text: 'Карандаш — канцтовар.' },
		],
		explanation:
			'Гитара, скрипка и барабан — инструменты. Карандаш — письменная принадлежность.',
	}),
]
