import type {
	Difficulty,
	MultipleChoicePuzzle,
	Puzzle,
	TextInputPuzzle,
} from '../types'

/**
 * Curated Russian word puzzles (original wording).
 * IDs are stable — do not renumber casually.
 */

function mc(params: {
	id: string
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
		category: 'words',
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
			tags: params.tags ?? ['curated', 'words'],
		},
	}
}

function text(params: {
	id: string
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
		category: 'words',
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
			tags: params.tags ?? ['curated', 'words'],
		},
	}
}

export const CURATED_WORDS_PUZZLES: Puzzle[] = [
	// --- Analogies ---
	mc({
		id: 'curated.words.p01',
		difficulty: 1,
		prompt: 'Кот относится к кошке как пёс к…',
		options: [
			{ id: 'a', label: 'собаке' },
			{ id: 'b', label: 'коту' },
			{ id: 'c', label: 'щенку' },
			{ id: 'd', label: 'хвосту' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Сравните пару «самец — самка».' },
			{ level: 2, text: 'Кот — самец, кошка — самка; пёс — самец, …' },
		],
		explanation:
			'Кот и кошка — самец и самка одного вида. Пёс — самец, парная самка — собака.',
		tags: ['curated', 'words', 'analogy'],
	}),
	mc({
		id: 'curated.words.p02',
		difficulty: 2,
		prompt: 'День относится к ночи как свет к…',
		options: [
			{ id: 'a', label: 'луне' },
			{ id: 'b', label: 'тьме' },
			{ id: 'c', label: 'солнцу' },
			{ id: 'd', label: 'утром' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Это пара противоположностей.' },
			{ level: 2, text: 'День ↔ ночь, свет ↔ …' },
		],
		explanation:
			'День и ночь — противоположности. Противоположность света — тьма.',
		tags: ['curated', 'words', 'analogy'],
	}),
	mc({
		id: 'curated.words.p03',
		difficulty: 2,
		prompt: 'Перо относится к птице как чешуя к…',
		options: [
			{ id: 'a', label: 'змее' },
			{ id: 'b', label: 'шерсти' },
			{ id: 'c', label: 'крылу' },
			{ id: 'd', label: 'воде' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Что покрывает тело животного?' },
			{ level: 2, text: 'Перо — покров птицы; чешуя — покров …' },
		],
		explanation:
			'Перо — типичный покров птицы. Чешуя — типичный покров змеи.',
		tags: ['curated', 'words', 'analogy'],
	}),
	mc({
		id: 'curated.words.p04',
		difficulty: 3,
		prompt: 'Автор относится к книге как композитор к…',
		options: [
			{ id: 'a', label: 'нотам' },
			{ id: 'b', label: 'музыке' },
			{ id: 'c', label: 'оркестру' },
			{ id: 'd', label: 'концерту' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Что создаёт каждый из них?' },
			{ level: 2, text: 'Автор создаёт книгу; композитор создаёт …' },
		],
		explanation:
			'Автор — создатель книги. Композитор — создатель музыки.',
		tags: ['curated', 'words', 'analogy'],
	}),
	mc({
		id: 'curated.words.p05',
		difficulty: 2,
		prompt: 'Ключ относится к замку как пароль к…',
		options: [
			{ id: 'a', label: 'двери' },
			{ id: 'b', label: 'аккаунту' },
			{ id: 'c', label: 'клавише' },
			{ id: 'd', label: 'шифру' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Чем открывают доступ?' },
			{ level: 2, text: 'Ключ открывает замок; пароль открывает …' },
		],
		explanation:
			'Ключ даёт доступ к замку. Пароль даёт доступ к аккаунту.',
		tags: ['curated', 'words', 'analogy'],
	}),

	// --- Odd word out ---
	mc({
		id: 'curated.words.p06',
		difficulty: 1,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'яблоко' },
			{ id: 'b', label: 'груша' },
			{ id: 'c', label: 'слива' },
			{ id: 'd', label: 'морковь' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Три слова — фрукты.' },
			{ level: 2, text: 'Морковь — овощ.' },
		],
		explanation:
			'Яблоко, груша и слива — фрукты. Морковь — овощ, поэтому слово лишнее.',
		tags: ['curated', 'words', 'odd_one_out'],
	}),
	mc({
		id: 'curated.words.p07',
		difficulty: 1,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'стул' },
			{ id: 'b', label: 'стол' },
			{ id: 'c', label: 'шкаф' },
			{ id: 'd', label: 'ложка' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Три слова — мебель.' },
			{ level: 2, text: 'Ложка — столовый прибор.' },
		],
		explanation:
			'Стул, стол и шкаф — предметы мебели. Ложка — столовый прибор.',
		tags: ['curated', 'words', 'odd_one_out'],
	}),
	mc({
		id: 'curated.words.p08',
		difficulty: 2,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'понедельник' },
			{ id: 'b', label: 'вторник' },
			{ id: 'c', label: 'январь' },
			{ id: 'd', label: 'среда' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Три слова — дни недели.' },
			{ level: 2, text: 'Январь — месяц.' },
		],
		explanation:
			'Понедельник, вторник и среда — дни недели. Январь — месяц года.',
		tags: ['curated', 'words', 'odd_one_out'],
	}),
	mc({
		id: 'curated.words.p09',
		difficulty: 2,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'река' },
			{ id: 'b', label: 'озеро' },
			{ id: 'c', label: 'море' },
			{ id: 'd', label: 'гора' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Три слова связаны с водой.' },
			{ level: 2, text: 'Гора — форма рельефа, не водоём.' },
		],
		explanation:
			'Река, озеро и море — водоёмы. Гора — элемент рельефа суши.',
		tags: ['curated', 'words', 'odd_one_out'],
	}),
	mc({
		id: 'curated.words.p10',
		difficulty: 3,
		prompt: 'Какое слово лишнее?',
		options: [
			{ id: 'a', label: 'бежать' },
			{ id: 'b', label: 'прыгать' },
			{ id: 'c', label: 'сидеть' },
			{ id: 'd', label: 'плыть' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Какие действия связаны с перемещением?' },
			{ level: 2, text: 'Сидеть — положение без движения.' },
		],
		explanation:
			'Бежать, прыгать и плыть — активные перемещения. Сидеть — положение без движения.',
		tags: ['curated', 'words', 'odd_one_out'],
	}),

	// --- Simple anagrams ---
	text({
		id: 'curated.words.p11',
		difficulty: 1,
		prompt:
			'Переставьте буквы в слове «ЛИСА» так, чтобы получилось другое существительное.',
		answer: 'сила',
		hints: [
			{ level: 1, text: 'Используйте все четыре буквы.' },
			{ level: 2, text: 'Слово про мощь, энергию.' },
		],
		explanation: 'Из букв слова «лиса» получается «сила».',
		tags: ['curated', 'words', 'anagram'],
	}),
	text({
		id: 'curated.words.p12',
		difficulty: 2,
		prompt:
			'Переставьте буквы в слове «СОСНА» так, чтобы получилось название прибора.',
		answer: 'насос',
		hints: [
			{ level: 1, text: 'Прибор для перекачки жидкости или воздуха.' },
			{ level: 2, text: 'Слово начинается на «н».' },
		],
		explanation: 'Из букв слова «сосна» получается «насос».',
		tags: ['curated', 'words', 'anagram'],
	}),
	text({
		id: 'curated.words.p13',
		difficulty: 2,
		prompt:
			'Переставьте буквы в слове «ПИЛА» так, чтобы получилось название дерева.',
		answer: 'липа',
		hints: [
			{ level: 1, text: 'Дерево с душистыми цветами.' },
			{ level: 2, text: 'Слово из четырёх букв, начинается на «л».' },
		],
		explanation: 'Из букв слова «пила» получается «липа».',
		tags: ['curated', 'words', 'anagram'],
	}),
	text({
		id: 'curated.words.p14',
		difficulty: 4,
		prompt:
			'Переставьте буквы в слове «КАРЕТА» так, чтобы получилось название летательного аппарата.',
		answer: 'ракета',
		hints: [
			{ level: 1, text: 'Летает в космос.' },
			{ level: 2, text: 'Слово начинается на «р».' },
		],
		explanation: 'Из букв слова «карета» получается «ракета».',
		tags: ['curated', 'words', 'anagram'],
	}),
	text({
		id: 'curated.words.p15',
		difficulty: 2,
		prompt:
			'Переставьте буквы в слове «БАНКА» так, чтобы получилось название животного.',
		answer: 'кабан',
		hints: [
			{ level: 1, text: 'Дикий родственник свиньи.' },
			{ level: 2, text: 'Слово начинается на «к».' },
		],
		explanation: 'Из букв слова «банка» получается «кабан».',
		tags: ['curated', 'words', 'anagram'],
	}),

	// --- Missing letter ---
	text({
		id: 'curated.words.p16',
		difficulty: 1,
		prompt: 'Вставьте пропущенную букву: МОЛ_КО',
		answer: 'о',
		hints: [
			{ level: 1, text: 'Получится название напитка.' },
			{ level: 2, text: 'Напиток белого цвета.' },
		],
		explanation: 'Пропущенная буква «о»: получается слово «молоко».',
		tags: ['curated', 'words', 'missing_letter'],
	}),
	text({
		id: 'curated.words.p17',
		difficulty: 1,
		prompt: 'Вставьте пропущенную букву: КН_ГА',
		answer: 'и',
		hints: [
			{ level: 1, text: 'Предмет для чтения.' },
			{ level: 2, text: 'Напечатанные страницы в обложке.' },
		],
		explanation: 'Пропущенная буква «и»: получается слово «книга».',
		tags: ['curated', 'words', 'missing_letter'],
	}),
	text({
		id: 'curated.words.p18',
		difficulty: 1,
		prompt: 'Вставьте пропущенную букву: С_ЛНЦЕ',
		answer: 'о',
		hints: [
			{ level: 1, text: 'Светило на небе днём.' },
			{ level: 2, text: 'От него тепло и свет.' },
		],
		explanation: 'Пропущенная буква «о»: получается слово «солнце».',
		tags: ['curated', 'words', 'missing_letter'],
	}),
	text({
		id: 'curated.words.p19',
		difficulty: 2,
		prompt: 'Вставьте пропущенную букву: Д_РЕВО',
		answer: 'е',
		hints: [
			{ level: 1, text: 'Растение с стволом и кроной.' },
			{ level: 2, text: 'Из него делают мебель и бумагу.' },
		],
		explanation: 'Пропущенная буква «е»: получается слово «дерево».',
		tags: ['curated', 'words', 'missing_letter'],
	}),
	text({
		id: 'curated.words.p20',
		difficulty: 2,
		prompt: 'Вставьте пропущенную букву: Х_ЕБ',
		answer: 'л',
		hints: [
			{ level: 1, text: 'Основной продукт на столе.' },
			{ level: 2, text: 'Выпекают из муки.' },
		],
		explanation: 'Пропущенная буква «л»: получается слово «хлеб».',
		tags: ['curated', 'words', 'missing_letter'],
	}),

	// --- Word relations ---
	mc({
		id: 'curated.words.p21',
		difficulty: 1,
		prompt: 'Какое слово является антонимом к «холодный»?',
		options: [
			{ id: 'a', label: 'тёплый' },
			{ id: 'b', label: 'мокрый' },
			{ id: 'c', label: 'тихий' },
			{ id: 'd', label: 'длинный' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Антоним — слово с противоположным смыслом.' },
			{ level: 2, text: 'Противоположность холоду — тепло.' },
		],
		explanation:
			'Антоним к «холодный» — «тёплый» (противоположная температура).',
		tags: ['curated', 'words', 'relation'],
	}),
	mc({
		id: 'curated.words.p22',
		difficulty: 2,
		prompt: 'Какое слово ближе всего по смыслу к «быстрый»?',
		options: [
			{ id: 'a', label: 'скорый' },
			{ id: 'b', label: 'высокий' },
			{ id: 'c', label: 'тяжёлый' },
			{ id: 'd', label: 'громкий' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Ищите синоним — близкое по значению слово.' },
			{ level: 2, text: '«Скорый» тоже говорит о скорости.' },
		],
		explanation: '«Скорый» — синоним слова «быстрый».',
		tags: ['curated', 'words', 'relation'],
	}),
	mc({
		id: 'curated.words.p23',
		difficulty: 2,
		prompt: 'Какое слово обозначает детёныша коровы?',
		options: [
			{ id: 'a', label: 'телёнок' },
			{ id: 'b', label: 'жеребёнок' },
			{ id: 'c', label: 'ягнёнок' },
			{ id: 'd', label: 'козлёнок' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Отделите детёнышей других животных.' },
			{ level: 2, text: 'Жеребёнок — у лошади, ягнёнок — у овцы.' },
		],
		explanation: 'Детёныш коровы — телёнок.',
		tags: ['curated', 'words', 'relation'],
	}),
	mc({
		id: 'curated.words.p24',
		difficulty: 3,
		prompt: 'Какое слово является частью целого «дерево»?',
		options: [
			{ id: 'a', label: 'ветка' },
			{ id: 'b', label: 'лес' },
			{ id: 'c', label: 'сад' },
			{ id: 'd', label: 'почва' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Что физически входит в состав дерева?' },
			{ level: 2, text: 'Лес и сад — места, где деревья растут.' },
		],
		explanation:
			'Ветка — часть дерева. Лес и сад — совокупности растений; почва — среда, а не часть дерева.',
		tags: ['curated', 'words', 'relation'],
	}),
	text({
		id: 'curated.words.p25',
		difficulty: 2,
		prompt:
			'Напишите слово, которое означает противоположность слову «начало».',
		answer: 'конец',
		acceptedAnswers: ['завершение', 'окончание'],
		hints: [
			{ level: 1, text: 'Где заканчивается путь или рассказ?' },
			{ level: 2, text: 'Короткое слово из пяти букв.' },
		],
		explanation:
			'Антоним к «начало» — «конец» (также допустимы «завершение», «окончание»).',
		tags: ['curated', 'words', 'relation'],
	}),

	// --- Concept sequences ---
	mc({
		id: 'curated.words.p26',
		difficulty: 1,
		prompt: 'Что идёт следующим: утро, день, вечер, …?',
		options: [
			{ id: 'a', label: 'ночь' },
			{ id: 'b', label: 'полдень' },
			{ id: 'c', label: 'неделя' },
			{ id: 'd', label: 'завтра' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Это порядок частей суток.' },
			{ level: 2, text: 'После вечера наступает …' },
		],
		explanation:
			'Части суток идут по кругу: утро → день → вечер → ночь.',
		tags: ['curated', 'words', 'sequence'],
	}),
	mc({
		id: 'curated.words.p27',
		difficulty: 2,
		prompt: 'Что идёт следующим: понедельник, вторник, среда, …?',
		options: [
			{ id: 'a', label: 'четверг' },
			{ id: 'b', label: 'пятница' },
			{ id: 'c', label: 'суббота' },
			{ id: 'd', label: 'воскресенье' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Это дни недели по порядку.' },
			{ level: 2, text: 'После среды идёт четверг.' },
		],
		explanation: 'После среды по порядку следует четверг.',
		tags: ['curated', 'words', 'sequence'],
	}),
	mc({
		id: 'curated.words.p28',
		difficulty: 2,
		prompt: 'Что идёт следующим: зима, весна, лето, …?',
		options: [
			{ id: 'a', label: 'осень' },
			{ id: 'b', label: 'январь' },
			{ id: 'c', label: 'декабрь' },
			{ id: 'd', label: 'дождь' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Это времена года по кругу.' },
			{ level: 2, text: 'После лета наступает …' },
		],
		explanation: 'Времена года: зима → весна → лето → осень.',
		tags: ['curated', 'words', 'sequence'],
	}),
	mc({
		id: 'curated.words.p29',
		difficulty: 3,
		prompt: 'Что идёт следующим: ребёнок, подросток, взрослый, …?',
		options: [
			{ id: 'a', label: 'пожилой' },
			{ id: 'b', label: 'ученик' },
			{ id: 'c', label: 'друг' },
			{ id: 'd', label: 'сосед' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Это этапы возраста человека.' },
			{ level: 2, text: 'После взрослого возраста — пожилой.' },
		],
		explanation:
			'Возрастные этапы: ребёнок → подросток → взрослый → пожилой.',
		tags: ['curated', 'words', 'sequence'],
	}),
	text({
		id: 'curated.words.p30',
		difficulty: 3,
		prompt:
			'Продолжите ряд одним словом: семя, росток, саженец, …',
		answer: 'дерево',
		acceptedAnswers: ['растение'],
		hints: [
			{ level: 1, text: 'Это стадии роста растения.' },
			{ level: 2, text: 'Из саженца вырастает …' },
		],
		explanation:
			'Ряд показывает рост: семя → росток → саженец → дерево (растение).',
		tags: ['curated', 'words', 'sequence'],
	}),

	// --- Short definition → word ---
	text({
		id: 'curated.words.p31',
		difficulty: 1,
		prompt: 'Как называется место, где учатся школьники? (одно слово)',
		answer: 'школа',
		hints: [
			{ level: 1, text: 'Здание с классами и учителями.' },
			{ level: 2, text: 'Слово из пяти букв.' },
		],
		explanation: 'Место учёбы школьников — школа.',
		tags: ['curated', 'words', 'definition'],
	}),
	text({
		id: 'curated.words.p32',
		difficulty: 1,
		prompt:
			'Как называется большой водоём с солёной водой? (одно слово)',
		answer: 'море',
		acceptedAnswers: ['океан'],
		hints: [
			{ level: 1, text: 'Не пресное озеро.' },
			{ level: 2, text: 'Короткое слово из четырёх букв.' },
		],
		explanation:
			'Большой солёный водоём — море (также допустим «океан»).',
		tags: ['curated', 'words', 'definition'],
	}),
	text({
		id: 'curated.words.p33',
		difficulty: 2,
		prompt:
			'Как называется инструмент для измерения времени на руке? (одно слово)',
		answer: 'часы',
		hints: [
			{ level: 1, text: 'Носят на запястье.' },
			{ level: 2, text: 'Показывают часы и минуты.' },
		],
		explanation: 'Инструмент для измерения времени на руке — часы.',
		tags: ['curated', 'words', 'definition'],
	}),
	text({
		id: 'curated.words.p34',
		difficulty: 4,
		prompt:
			'Как называется человек, который лечит животных? (одно слово)',
		answer: 'ветеринар',
		acceptedAnswers: ['ветврач'],
		hints: [
			{ level: 1, text: 'Не обычный врач для людей.' },
			{ level: 2, text: 'Часто сокращают как «ветврач».' },
		],
		explanation:
			'Врач для животных — ветеринар (также допустим «ветврач»).',
		tags: ['curated', 'words', 'definition'],
	}),
	text({
		id: 'curated.words.p35',
		difficulty: 4,
		prompt:
			'Как называется наука о числах, фигурах и вычислениях? (одно слово)',
		answer: 'математика',
		hints: [
			{ level: 1, text: 'Школьный предмет рядом с физикой.' },
			{ level: 2, text: 'Слово начинается на «м», длинное.' },
		],
		explanation:
			'Наука о числах, фигурах и вычислениях — математика.',
		tags: ['curated', 'words', 'definition'],
	}),
]
