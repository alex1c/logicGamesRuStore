import type { Difficulty, MultipleChoicePuzzle, Puzzle } from '../types'

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
		category: 'logic',
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
			tags: params.tags ?? ['curated', 'logic'],
		},
	}
}

/**
 * Curated Russian multiple-choice logic puzzles (stable ids p01…p35).
 * p01–p05 restate the familiar Phase-1 themes with new ids only.
 */
export const CURATED_LOGIC_PUZZLES: Puzzle[] = [
	// --- Phase-1 themes (new ids) ---
	mc({
		id: 'curated.logic.p01',
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
		id: 'curated.logic.p02',
		difficulty: 2,
		prompt:
			'В ряд сидят трое: Кира, Лев и Мила. Кира справа от Льва, Мила слева от Льва. Кто сидит посередине?',
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
			'В ряду: Мила слева от Льва, Кира справа от Льва — Лев сидит посередине.',
		tags: ['curated', 'logic', 'spatial'],
	}),
	mc({
		id: 'curated.logic.p03',
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
		id: 'curated.logic.p04',
		difficulty: 2,
		prompt: 'Послезавтра — пятница. Какой день недели был вчера?',
		options: [
			{ id: 'a', label: 'Вторник' },
			{ id: 'b', label: 'Среда' },
			{ id: 'c', label: 'Четверг' },
			{ id: 'd', label: 'Понедельник' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Сначала найдите, какой сегодня день.' },
			{
				level: 2,
				text: 'Послезавтра пятница → завтра четверг → сегодня среда → вчера вторник.',
			},
		],
		explanation:
			'Послезавтра — пятница, значит завтра — четверг, сегодня — среда, вчера — вторник.',
		tags: ['curated', 'logic', 'calendar'],
	}),
	mc({
		id: 'curated.logic.p05',
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
		tags: ['curated', 'logic', 'relations'],
	}),

	// --- Original puzzles ---
	mc({
		id: 'curated.logic.p06',
		difficulty: 1,
		prompt:
			'Все карандаши в коробке синие. На столе лежит карандаш из этой коробки. Какого он цвета?',
		options: [
			{ id: 'a', label: 'Синий' },
			{ id: 'b', label: 'Красный' },
			{ id: 'c', label: 'Зелёный' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Карандаш взят именно из этой коробки.' },
			{ level: 2, text: 'В коробке все карандаши синие.' },
		],
		explanation:
			'Карандаш из коробки, где все карандаши синие, — значит он синий.',
		tags: ['curated', 'logic', 'deduction'],
	}),
	mc({
		id: 'curated.logic.p07',
		difficulty: 1,
		prompt:
			'Ира старше Оли. Оля старше Нины. Кто из троих самый младший?',
		options: [
			{ id: 'a', label: 'Ира' },
			{ id: 'b', label: 'Оля' },
			{ id: 'c', label: 'Нина' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Выстройте возраст по убыванию.' },
			{ level: 2, text: 'Ира > Оля > Нина.' },
		],
		explanation:
			'Ира старше Оли, Оля старше Нины — Нина младше обеих.',
		tags: ['curated', 'logic', 'comparison'],
	}),
	mc({
		id: 'curated.logic.p08',
		difficulty: 2,
		prompt:
			'В ряд стоят три дома: синий, жёлтый и зелёный. Синий сразу слева от жёлтого. Зелёный сразу справа от жёлтого. Какой дом посередине?',
		options: [
			{ id: 'a', label: 'Синий' },
			{ id: 'b', label: 'Жёлтый' },
			{ id: 'c', label: 'Зелёный' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Соберите цепочку слева направо.' },
			{ level: 2, text: 'Синий — жёлтый — зелёный.' },
		],
		explanation:
			'Синий слева от жёлтого, зелёный справа от жёлтого — посередине жёлтый.',
		tags: ['curated', 'logic', 'order'],
	}),
	mc({
		id: 'curated.logic.p09',
		difficulty: 2,
		prompt:
			'Рома, Саша и Тима живут на этажах 2, 4 и 5 (по одному на этаж). Рома выше Саши. Тима ниже Саши. Кто живёт на 4-м этаже?',
		options: [
			{ id: 'a', label: 'Рома' },
			{ id: 'b', label: 'Саша' },
			{ id: 'c', label: 'Тима' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Тима ниже Саши, Рома выше Саши.' },
			{ level: 2, text: 'Саша посередине — на 4-м этаже.' },
		],
		explanation:
			'Тима на 2-м, Саша на 4-м, Рома на 5-м. На 4-м живёт Саша.',
		tags: ['curated', 'logic', 'who-where'],
	}),
	mc({
		id: 'curated.logic.p10',
		difficulty: 2,
		prompt:
			'Из двух утверждений верно ровно одно: «Лампа выключена» и «Дверь закрыта». Лампа включена. Что верно про дверь?',
		options: [
			{ id: 'a', label: 'Дверь закрыта' },
			{ id: 'b', label: 'Дверь открыта' },
			{ id: 'c', label: 'Состояние двери неизвестно' },
			{ id: 'd', label: 'Оба утверждения ложны' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: '«Лампа выключена» ложно.' },
			{ level: 2, text: 'Ровно одно верно → второе истинно.' },
		],
		explanation:
			'«Лампа выключена» ложно. Чтобы ровно одно было верным, «Дверь закрыта» истинно.',
		tags: ['curated', 'logic', 'true-false'],
	}),
	mc({
		id: 'curated.logic.p11',
		difficulty: 1,
		prompt:
			'Чашка тяжелее ложки. Ложка тяжелее вилки. Что тяжелее — чашка или вилка?',
		options: [
			{ id: 'a', label: 'Чашка' },
			{ id: 'b', label: 'Вилка' },
			{ id: 'c', label: 'Одинаково' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Сравните по цепочке.' },
			{ level: 2, text: 'Чашка > ложка > вилка.' },
		],
		explanation:
			'Чашка тяжелее ложки, ложка тяжелее вилки — чашка тяжелее вилки.',
		tags: ['curated', 'logic', 'comparison'],
	}),
	mc({
		id: 'curated.logic.p12',
		difficulty: 2,
		prompt:
			'Пешеход шёл на север, повернул направо, затем ещё раз направо. Куда он смотрит сейчас?',
		options: [
			{ id: 'a', label: 'На север' },
			{ id: 'b', label: 'На юг' },
			{ id: 'c', label: 'На восток' },
			{ id: 'd', label: 'На запад' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Север → направо = восток.' },
			{ level: 2, text: 'Восток → направо = юг.' },
		],
		explanation:
			'Север, направо — восток, ещё направо — юг.',
		tags: ['curated', 'logic', 'directions'],
	}),
	mc({
		id: 'curated.logic.p13',
		difficulty: 3,
		prompt:
			'У Кати есть сестра и есть братья. У её брата столько же сестёр, сколько братьев. Сколько всего детей в семье?',
		options: [
			{ id: 'a', label: '3' },
			{ id: 'b', label: '4' },
			{ id: 'c', label: '5' },
			{ id: 'd', label: '6' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'У Кати уже сестра и братья — минимум четверо.' },
			{
				level: 2,
				text: 'У брата 2 сестры и 2 брата (кроме него) → 2 девочки и 3 мальчика.',
			},
		],
		explanation:
			'У брата число сестёр равно числу братьев (не считая себя): 2 сестры и 2 брата. Всего 2 девочки и 3 мальчика — пятеро детей.',
		tags: ['curated', 'logic', 'relations'],
	}),
	mc({
		id: 'curated.logic.p14',
		difficulty: 2,
		prompt:
			'На полке книги А, Б и В. А левее Б. В правее Б. Какая книга посередине?',
		options: [
			{ id: 'a', label: 'А' },
			{ id: 'b', label: 'Б' },
			{ id: 'c', label: 'В' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Расположите слева направо.' },
			{ level: 2, text: 'А — Б — В.' },
		],
		explanation: 'А левее Б, В правее Б — посередине Б.',
		tags: ['curated', 'logic', 'order'],
	}),
	mc({
		id: 'curated.logic.p15',
		difficulty: 3,
		prompt:
			'Врач, учитель и повар — Даша, Егор и Женя. Даша не врач. Егор не учитель. Женя — не повар и не учитель. Кто врач?',
		options: [
			{ id: 'a', label: 'Даша' },
			{ id: 'b', label: 'Егор' },
			{ id: 'c', label: 'Женя' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Женя не повар и не учитель.' },
			{ level: 2, text: 'Значит Женя — врач.' },
		],
		explanation:
			'Женя не повар и не учитель → Женя врач. Даша — учитель, Егор — повар.',
		tags: ['curated', 'logic', 'who-where'],
	}),
	mc({
		id: 'curated.logic.p16',
		difficulty: 1,
		prompt: 'Вчера было воскресенье. Какой день недели сегодня?',
		options: [
			{ id: 'a', label: 'Понедельник' },
			{ id: 'b', label: 'Вторник' },
			{ id: 'c', label: 'Суббота' },
			{ id: 'd', label: 'Пятница' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'День после воскресенья.' },
			{ level: 2, text: 'После воскресенья идёт понедельник.' },
		],
		explanation: 'После воскресенья следует понедельник.',
		tags: ['curated', 'logic', 'calendar'],
	}),
	mc({
		id: 'curated.logic.p17',
		difficulty: 2,
		prompt:
			'В коробке было три шара: два красных и один синий. Достали один красный шар. Сколько красных шаров осталось в коробке?',
		options: [
			{ id: 'a', label: '0' },
			{ id: 'b', label: '1' },
			{ id: 'c', label: '2' },
			{ id: 'd', label: '3' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Было два красных, один убрали.' },
			{ level: 2, text: '2 − 1 = 1.' },
		],
		explanation:
			'Было два красных; один красный достали — остался один красный.',
		tags: ['curated', 'logic', 'deduction'],
	}),
	mc({
		id: 'curated.logic.p18',
		difficulty: 2,
		prompt:
			'Маша, Петя и Оля стоят в очереди. Маша сразу перед Петей. Оля последняя. Кто первый?',
		options: [
			{ id: 'a', label: 'Маша' },
			{ id: 'b', label: 'Петя' },
			{ id: 'c', label: 'Оля' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Оля на последнем месте.' },
			{ level: 2, text: 'Маша сразу перед Петей → Маша, Петя, Оля.' },
		],
		explanation:
			'Оля последняя. Маша сразу перед Петей — значит порядок: Маша, Петя, Оля. Первая — Маша.',
		tags: ['curated', 'logic', 'order'],
	}),
	mc({
		id: 'curated.logic.p19',
		difficulty: 2,
		prompt:
			'Артём, Борис и Кирилл пьют чай, кофе и сок (каждый — свой напиток). Борис пьёт сок. Артём не пьёт чай. Что пьёт Артём?',
		options: [
			{ id: 'a', label: 'Чай' },
			{ id: 'b', label: 'Кофе' },
			{ id: 'c', label: 'Сок' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Сок уже у Бориса.' },
			{ level: 2, text: 'Артём не пьёт чай → ему остаётся кофе.' },
		],
		explanation:
			'Борис пьёт сок. Артём не чай — значит Артём пьёт кофе, Кирилл — чай.',
		tags: ['curated', 'logic', 'who-where'],
	}),
	mc({
		id: 'curated.logic.p20',
		difficulty: 2,
		prompt:
			'Пешеход шёл на восток, повернул налево, затем направо. Куда он смотрит?',
		options: [
			{ id: 'a', label: 'На север' },
			{ id: 'b', label: 'На юг' },
			{ id: 'c', label: 'На восток' },
			{ id: 'd', label: 'На запад' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Восток → налево = север.' },
			{ level: 2, text: 'Север → направо = восток.' },
		],
		explanation:
			'Восток, налево — север, направо — снова восток.',
		tags: ['curated', 'logic', 'directions'],
	}),
	mc({
		id: 'curated.logic.p21',
		difficulty: 1,
		prompt:
			'Дима бегает быстрее Егора. Егор быстрее Жени. Кто из троих самый медленный?',
		options: [
			{ id: 'a', label: 'Дима' },
			{ id: 'b', label: 'Егор' },
			{ id: 'c', label: 'Женя' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Выстройте по скорости.' },
			{ level: 2, text: 'Дима > Егор > Женя.' },
		],
		explanation:
			'Дима быстрее Егора, Егор быстрее Жени — Женя самый медленный.',
		tags: ['curated', 'logic', 'comparison'],
	}),
	mc({
		id: 'curated.logic.p22',
		difficulty: 3,
		prompt:
			'Утверждение «оба окна открыты» ложно. Левое окно открыто. Каково состояние правого окна?',
		options: [
			{ id: 'a', label: 'Открыто' },
			{ id: 'b', label: 'Закрыто' },
			{ id: 'c', label: 'Может быть любым' },
			{ id: 'd', label: 'Оба закрыты' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: '«Оба открыты» ложно — хотя бы одно закрыто.' },
			{ level: 2, text: 'Левое открыто → закрыто должно быть правое.' },
		],
		explanation:
			'Если оба открыты — ложь, а левое открыто, то правое закрыто.',
		tags: ['curated', 'logic', 'true-false'],
	}),
	mc({
		id: 'curated.logic.p23',
		difficulty: 1,
		prompt:
			'В лифте ехали трое. На этаже вышли двое, вошёл один. Сколько человек едет дальше?',
		options: [
			{ id: 'a', label: '1' },
			{ id: 'b', label: '2' },
			{ id: 'c', label: '3' },
			{ id: 'd', label: '4' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: '3 − 2 + 1.' },
			{ level: 2, text: 'Остаётся двое.' },
		],
		explanation: 'Было трое, вышли двое, вошёл один: 3 − 2 + 1 = 2.',
		tags: ['curated', 'logic', 'situation'],
	}),
	mc({
		id: 'curated.logic.p24',
		difficulty: 3,
		prompt:
			'На финише трое: Наташа, Оля и Полина. Вторая — Оля. Третья — не Полина. Кто финишировал первой?',
		options: [
			{ id: 'a', label: 'Наташа' },
			{ id: 'b', label: 'Оля' },
			{ id: 'c', label: 'Полина' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Вторая — Оля.' },
			{ level: 2, text: 'Третья не Полина → третья Наташа → первая Полина.' },
		],
		explanation:
			'Вторая — Оля. Третья не Полина, значит третья — Наташа, первая — Полина.',
		tags: ['curated', 'logic', 'order'],
	}),
	mc({
		id: 'curated.logic.p25',
		difficulty: 3,
		prompt:
			'Мама Маши — сестра папы Пети. Кем приходится Маша Пете?',
		options: [
			{ id: 'a', label: 'Сестрой' },
			{ id: 'b', label: 'Двоюродной сестрой' },
			{ id: 'c', label: 'Тётей' },
			{ id: 'd', label: 'Мамой' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Мамы Маши и папы Пети — брат и сестра.' },
			{ level: 2, text: 'Дети брата и сестры — двоюродные.' },
		],
		explanation:
			'Мама Маши и папа Пети — брат и сестра, поэтому Маша и Петя — двоюродные сестра и брат.',
		tags: ['curated', 'logic', 'relations'],
	}),
	mc({
		id: 'curated.logic.p26',
		difficulty: 2,
		prompt:
			'У Лены, Игоря и Нади — кот, пёс и рыбка (у каждого своё). Игорь с рыбкой. Лена не с котом. У кого пёс?',
		options: [
			{ id: 'a', label: 'У Лены' },
			{ id: 'b', label: 'У Игоря' },
			{ id: 'c', label: 'У Нади' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Рыбка у Игоря.' },
			{ level: 2, text: 'Лена не с котом → у Лены пёс, у Нади кот.' },
		],
		explanation:
			'Игорь с рыбкой. Лена не с котом — значит у Лены пёс, у Нади кот.',
		tags: ['curated', 'logic', 'who-where'],
	}),
	mc({
		id: 'curated.logic.p27',
		difficulty: 3,
		prompt:
			'Человек смотрел на запад и три раза подряд повернул налево. Куда он смотрит сейчас?',
		options: [
			{ id: 'a', label: 'На север' },
			{ id: 'b', label: 'На юг' },
			{ id: 'c', label: 'На восток' },
			{ id: 'd', label: 'На запад' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Запад → налево = юг.' },
			{ level: 2, text: 'Юг → восток → север.' },
		],
		explanation:
			'Запад, налево — юг, ещё налево — восток, ещё налево — север.',
		tags: ['curated', 'logic', 'directions'],
	}),
	mc({
		id: 'curated.logic.p28',
		difficulty: 1,
		prompt:
			'Все ученики класса сдали зачёт. Миша — ученик этого класса. Сдал ли Миша зачёт?',
		options: [
			{ id: 'a', label: 'Да' },
			{ id: 'b', label: 'Нет' },
			{ id: 'c', label: 'Нельзя определить' },
			{ id: 'd', label: 'Только если отличник' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Миша входит в «всех учеников класса».' },
			{ level: 2, text: 'Значит и он сдал.' },
		],
		explanation:
			'Миша — ученик этого класса, а все ученики сдали — значит Миша тоже сдал.',
		tags: ['curated', 'logic', 'deduction'],
	}),
	mc({
		id: 'curated.logic.p29',
		difficulty: 2,
		prompt:
			'Кате сейчас 10 лет. Через 2 года ей будет столько, сколько сейчас Лене. Сколько лет Лене сейчас?',
		options: [
			{ id: 'a', label: '8' },
			{ id: 'b', label: '10' },
			{ id: 'c', label: '12' },
			{ id: 'd', label: '14' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'Через 2 года Кате будет 12.' },
			{ level: 2, text: 'Это и есть нынешний возраст Лены.' },
		],
		explanation: 'Через 2 года Кате 12 — столько Лене сейчас.',
		tags: ['curated', 'logic', 'comparison'],
	}),
	mc({
		id: 'curated.logic.p30',
		difficulty: 3,
		prompt:
			'Правдин всегда говорит правду, Лгунов всегда лжёт. Правдин сказал: «Сейчас день». Лгунов сказал: «Сейчас ночь». Что сейчас?',
		options: [
			{ id: 'a', label: 'День' },
			{ id: 'b', label: 'Ночь' },
			{ id: 'c', label: 'Нельзя определить' },
			{ id: 'd', label: 'Утро' },
		],
		answer: 'a',
		hints: [
			{ level: 1, text: 'Правдин не может ошибаться.' },
			{ level: 2, text: 'Если бы была ночь, Правдин солгал бы — невозможно.' },
		],
		explanation:
			'Правдин говорит «день» и всегда прав — сейчас день. Тогда «ночь» у Лгунова — ложь, как и положено.',
		tags: ['curated', 'logic', 'true-false'],
	}),
	mc({
		id: 'curated.logic.p31',
		difficulty: 1,
		prompt:
			'Верёвка А длиннее Б. Б длиннее В. В длиннее Г. Какая самая короткая?',
		options: [
			{ id: 'a', label: 'А' },
			{ id: 'b', label: 'Б' },
			{ id: 'c', label: 'В' },
			{ id: 'd', label: 'Г' },
		],
		answer: 'd',
		hints: [
			{ level: 1, text: 'Выстройте по длине.' },
			{ level: 2, text: 'А > Б > В > Г.' },
		],
		explanation: 'По цепочке неравенств самая короткая — Г.',
		tags: ['curated', 'logic', 'comparison'],
	}),
	mc({
		id: 'curated.logic.p32',
		difficulty: 3,
		prompt:
			'Три стула в ряд. Коля сел не справа. Маша справа от Коли. Вася справа от Маши. Кто посередине?',
		options: [
			{ id: 'a', label: 'Коля' },
			{ id: 'b', label: 'Маша' },
			{ id: 'c', label: 'Вася' },
			{ id: 'd', label: 'Нельзя определить' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'Маша справа от Коли, Вася справа от Маши.' },
			{ level: 2, text: 'Порядок: Коля — Маша — Вася.' },
		],
		explanation:
			'Цепочка «Коля, Маша, Вася» — единственная. Посередине Маша. Коля не справа — согласуется.',
		tags: ['curated', 'logic', 'order'],
	}),
	mc({
		id: 'curated.logic.p33',
		difficulty: 1,
		prompt:
			'На столе лежало 5 яблок. Съели 2, затем положили ещё 3. Сколько яблок на столе?',
		options: [
			{ id: 'a', label: '5' },
			{ id: 'b', label: '6' },
			{ id: 'c', label: '7' },
			{ id: 'd', label: '8' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: '5 − 2 + 3.' },
			{ level: 2, text: 'Получается 6.' },
		],
		explanation: '5 − 2 + 3 = 6 яблок.',
		tags: ['curated', 'logic', 'situation'],
	}),
	mc({
		id: 'curated.logic.p34',
		difficulty: 4,
		prompt:
			'Школа севернее парка. Магазин строго восточнее школы (на той же широте, что и школа). Где магазин относительно парка?',
		options: [
			{ id: 'a', label: 'Строго на севере' },
			{ id: 'b', label: 'Строго на востоке' },
			{ id: 'c', label: 'На северо-востоке' },
			{ id: 'd', label: 'На юго-востоке' },
		],
		answer: 'c',
		hints: [
			{ level: 1, text: 'От парка к школе — на север.' },
			{ level: 2, text: 'От школы к магазину — строго на восток → от парка на СВ.' },
		],
		explanation:
			'Школа севернее парка, магазин на той же широте строго восточнее школы — относительно парка магазин на северо-востоке.',
		tags: ['curated', 'logic', 'directions'],
	}),
	mc({
		id: 'curated.logic.p35',
		difficulty: 3,
		prompt:
			'Если идёт дождь, улицы мокрые. Улицы сухие. Что верно?',
		options: [
			{ id: 'a', label: 'Идёт дождь' },
			{ id: 'b', label: 'Дождя нет' },
			{ id: 'c', label: 'Дождь может идти или не идти' },
			{ id: 'd', label: 'Улицы всё равно мокрые' },
		],
		answer: 'b',
		hints: [
			{ level: 1, text: 'При дожде улицы были бы мокрыми.' },
			{ level: 2, text: 'Улицы сухие → дождя нет.' },
		],
		explanation:
			'Дождь всегда делает улицы мокрыми. Улицы сухие — значит дождя нет.',
		tags: ['curated', 'logic', 'deduction'],
	}),
]
