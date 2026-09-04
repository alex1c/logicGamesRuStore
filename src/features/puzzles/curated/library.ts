import type {
	Difficulty,
	MultipleChoicePuzzle,
	Puzzle,
	PuzzleCategory,
	TextInputPuzzle,
} from '../types'

/**
 * Manually authored demo puzzles (original wording).
 * IDs are stable — do not renumber casually.
 */

function mc(params: {
	id: string
	category: PuzzleCategory
	difficulty: Difficulty
	prompt: string
	options: { id: string; label: string }[]
	answer: string
	hints: { level: 1 | 2; text: string }[]
	explanation: string
	tags?: string[]
}): MultipleChoicePuzzle {
	return {
		id: params.id,
		type: 'curated.multiple_choice',
		category: params.category,
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
			tags: params.tags ?? ['curated'],
		},
	}
}

function text(params: {
	id: string
	category: PuzzleCategory
	difficulty: Difficulty
	prompt: string
	answer: string
	acceptedAnswers?: string[]
	hints: { level: 1 | 2; text: string }[]
	explanation: string
	tags?: string[]
}): TextInputPuzzle {
	return {
		id: params.id,
		type: 'curated.text_input',
		category: params.category,
		difficulty: params.difficulty,
		prompt: params.prompt,
		interactionType: 'text_input',
		answer: params.answer,
		acceptedAnswers: params.acceptedAnswers,
		caseSensitive: false,
		hints: params.hints,
		explanation: params.explanation,
		seed: 0,
		metadata: {
			generatorId: 'curated.library',
			generatorVersion: 1,
			tags: params.tags ?? ['curated'],
		},
	}
}

export const CURATED_PUZZLES: Puzzle[] = [
	mc({
		id: 'curated.logic.height-chain',
		category: 'logic',
		difficulty: 2,
		prompt:
			'Анна выше Бориса, а Борис выше Веры. Кто из троих самый высокий?',
		options: [
			{ id: 'a', label: 'Анна' },
			{ id: 'b', label: 'Борис' },
			{ id: 'c', label: 'Вера' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Сравните рост по цепочке неравенств.' },
			{ level: 2, text: 'Если А > Б и Б > В, то А самый высокий.' },
		],
		explanation:
			'Анна выше Бориса, Борис выше Веры — значит Анна выше всех троих.',
		tags: ['curated', 'logic', 'comparison'],
	}),
	mc({
		id: 'curated.logic.seats-left-right',
		category: 'logic',
		difficulty: 2,
		prompt:
			'За столом сидят трое: Кира, Лев и Мила. Кира справа от Льва, Мила слева от Льва. Кто сидит посередине?',
		options: [
			{ id: 'a', label: 'Кира' },
			{ id: 'b', label: 'Лев' },
			{ id: 'c', label: 'Мила' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Нарисуйте трёх человек в ряд.' },
			{ level: 2, text: 'Слева Мила, затем Лев, справа Кира.' },
		],
		explanation:
			'Мила слева от Льва, Кира справа от Льва — Лев сидит посередине.',
		tags: ['curated', 'logic', 'spatial'],
	}),
	mc({
		id: 'curated.logic.bus-stops',
		category: 'logic',
		difficulty: 2,
		prompt:
			'Автобус останавливается на каждой второй остановке. Он уже проехал остановки 1, 2 и 3 и остановился только на 2-й. На какой из следующих остановок (4, 5 или 6) он остановится?',
		options: [
			{ id: 'a', label: 'Только на 4' },
			{ id: 'b', label: 'Только на 5' },
			{ id: 'c', label: 'Только на 6' },
			{ id: 'd', label: 'На 4 и на 6' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: '«Каждая вторая» означает чётные номера.' },
			{ level: 2, text: 'Остановки 2, 4, 6…' },
		],
		explanation:
			'Автобус останавливается на чётных остановках: 2, 4, 6… Среди 4, 5 и 6 он остановится на 4 и на 6.',
		tags: ['curated', 'logic', 'pattern'],
	}),
	mc({
		id: 'curated.logic.calendar-days',
		category: 'logic',
		difficulty: 2,
		prompt:
			'Послезавтра — пятница. Какой день недели был вчера?',
		options: [
			{ id: 'a', label: 'Вторник' },
			{ id: 'b', label: 'Среда' },
			{ id: 'c', label: 'Четверг' },
			{ id: 'd', label: 'Понедельник' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Сначала найдите, какой сегодня день.' },
			{ level: 2, text: 'Послезавтра пятница → завтра четверг → сегодня среда → вчера вторник.' },
		],
		explanation:
			'Послезавтра — пятница, значит завтра — четверг, сегодня — среда, вчера — вторник.',
		tags: ['curated', 'logic', 'calendar'],
	}),
	mc({
		id: 'curated.odd.colors-word',
		category: 'odd_one_out',
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
			'Красный, синий и зелёный — названия цветов. «Стол» обозначает предмет мебели, поэтому слово лишнее.',
		tags: ['curated', 'odd_one_out'],
	}),
	mc({
		id: 'curated.odd.animals',
		category: 'odd_one_out',
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
			{ level: 1, text: 'Подумайте, кто из них не млекопитающее.' },
			{ level: 2, text: 'Воробей — птица.' },
		],
		explanation:
			'Кот, собака и лошадь — млекопитающие. Воробей — птица, поэтому слово лишнее.',
		tags: ['curated', 'odd_one_out'],
	}),
	mc({
		id: 'curated.odd.transport',
		category: 'odd_one_out',
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
			{ level: 1, text: 'Три слова связаны с транспортом.' },
			{ level: 2, text: 'Диван — мебель, а не транспорт.' },
		],
		explanation:
			'Автобус, трамвай и метро — виды транспорта. Диван — предмет мебели.',
		tags: ['curated', 'odd_one_out'],
	}),
	text({
		id: 'curated.words.anagram-salad',
		category: 'words',
		difficulty: 2,
		prompt:
			'Переставьте буквы в слове «АТЛАС» так, чтобы получилось название блюда.',
		answer: 'салат',
		acceptedAnswers: ['Салат', 'САЛАТ'],
		hints: [
			{ level: 1, text: 'Используйте все пять букв слова «атлас».' },
			{ level: 2, text: 'Блюдо из овощей; начинается на «с».' },
		],
		explanation:
			'Из букв слова «атлас» получается «салат».',
		tags: ['curated', 'words', 'anagram'],
	}),
	text({
		id: 'curated.words.missing-letter',
		category: 'words',
		difficulty: 1,
		prompt: 'Вставьте пропущенную букву: МОЛ_КО',
		answer: 'о',
		acceptedAnswers: ['О'],
		hints: [
			{ level: 1, text: 'Получится название напитка.' },
			{ level: 2, text: 'Напиток белого цвета.' },
		],
		explanation: 'Пропущенная буква «О»: получается слово «МОЛОКО».',
		tags: ['curated', 'words'],
	}),
	text({
		id: 'curated.words.synonym-fast',
		category: 'words',
		difficulty: 2,
		prompt: 'Подберите однокоренное существительное к слову «бегать» (одно слово).',
		answer: 'бег',
		acceptedAnswers: ['Бег', 'беготня', 'Беготня'],
		hints: [
			{ level: 1, text: 'Корень тот же, что в глаголе «бегать».' },
			{ level: 2, text: 'Короткое слово из трёх букв.' },
		],
		explanation:
			'Однокоренное существительное — «бег» (также допустима «беготня»).',
		tags: ['curated', 'words'],
	}),
	mc({
		id: 'curated.words.rhyme',
		category: 'words',
		difficulty: 1,
		prompt: 'Какое слово лучше всего рифмуется с «окно»?',
		options: [
			{ id: 'a', label: 'кино' },
			{ id: 'b', label: 'стол' },
			{ id: 'c', label: 'река' },
			{ id: 'd', label: 'лес' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Слушайте окончание слова.' },
			{ level: 2, text: 'Оба слова заканчиваются на «-но».' },
		],
		explanation: '«Окно» и «кино» имеют созвучное окончание.',
		tags: ['curated', 'words', 'rhyme'],
	}),
	mc({
		id: 'curated.logic.numbers-friends',
		category: 'logic',
		difficulty: 2,
		prompt:
			'У Пети две сестры и один брат. Сколько всего детей в семье, если считать Петю?',
		options: [
			{ id: 'a', label: '3' },
			{ id: 'b', label: '4' },
			{ id: 'c', label: '5' },
			{ id: 'd', label: '2' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Не забудьте посчитать самого Петю.' },
			{ level: 2, text: '2 сестры + 1 брат + Петя = 4.' },
		],
		explanation:
			'Две сестры, один брат и сам Петя — всего четверо детей.',
		tags: ['curated', 'logic'],
	}),
]

export function getCuratedById(id: string): Puzzle | undefined {
	return CURATED_PUZZLES.find((puzzle) => puzzle.id === id)
}

export function listCuratedByCategory(category: PuzzleCategory): Puzzle[] {
	return CURATED_PUZZLES.filter((puzzle) => puzzle.category === category)
}
