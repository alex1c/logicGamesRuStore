import {
	applySkillOutcome,
	classifyOutcome,
	clampSkill,
	skillToDifficulty,
	skillToDisplayScore,
	SKILL_DEFAULT,
	SKILL_MAX,
	SKILL_MIN,
} from '@/src/features/progress/skillModel'

describe('skill model', () => {
	it('correct without hint raises skill', () => {
		const next = applySkillOutcome(2, 'correct_no_hint')
		expect(next).toBeGreaterThan(2)
	})

	it('wrong lowers skill', () => {
		expect(applySkillOutcome(2, 'wrong')).toBeLessThan(2)
	})

	it('hint has smaller raise than clean correct', () => {
		const clean = applySkillOutcome(2, 'correct_no_hint')
		const hinted = applySkillOutcome(2, 'correct_with_hint')
		expect(hinted).toBeLessThan(clean)
		expect(hinted).toBeGreaterThanOrEqual(2)
	})

	it('solution revealed lowers skill', () => {
		expect(applySkillOutcome(2, 'solution_revealed')).toBeLessThan(2)
	})

	it('clamps at min and max without NaN', () => {
		expect(clampSkill(SKILL_MIN - 10)).toBe(SKILL_MIN)
		expect(clampSkill(SKILL_MAX + 10)).toBe(SKILL_MAX)
		expect(clampSkill(Number.NaN)).toBe(SKILL_DEFAULT)
		let value = SKILL_MIN
		for (let i = 0; i < 100; i += 1) {
			value = applySkillOutcome(value, 'wrong')
		}
		expect(value).toBe(SKILL_MIN)
		value = SKILL_MAX
		for (let i = 0; i < 100; i += 1) {
			value = applySkillOutcome(value, 'correct_no_hint')
		}
		expect(value).toBe(SKILL_MAX)
	})

	it('classifyOutcome mapping is stable', () => {
		expect(
			classifyOutcome({
				isCorrect: true,
				hintsUsed: 0,
				revealedSolution: false,
			}),
		).toBe('correct_no_hint')
		expect(
			classifyOutcome({
				isCorrect: true,
				hintsUsed: 1,
				revealedSolution: false,
			}),
		).toBe('correct_with_hint')
		expect(
			classifyOutcome({
				isCorrect: false,
				hintsUsed: 0,
				revealedSolution: false,
			}),
		).toBe('wrong')
		expect(
			classifyOutcome({
				isCorrect: true,
				hintsUsed: 0,
				revealedSolution: true,
			}),
		).toBe('solution_revealed')
	})

	it('skillToDifficulty is deterministic and nearby', () => {
		const d1 = skillToDifficulty(3, 42)
		const d2 = skillToDifficulty(3, 42)
		expect(d1).toBe(d2)
		expect(d1).toBeGreaterThanOrEqual(2)
		expect(d1).toBeLessThanOrEqual(4)
	})

	it('display score is 0–100', () => {
		expect(skillToDisplayScore(1)).toBe(0)
		expect(skillToDisplayScore(5)).toBe(100)
		expect(skillToDisplayScore(3)).toBe(50)
	})
})
