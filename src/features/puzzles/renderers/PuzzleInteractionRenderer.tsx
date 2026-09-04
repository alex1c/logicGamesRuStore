import type { Puzzle } from '../types'
import { MultipleChoiceRenderer } from './MultipleChoiceRenderer'
import { NumericInputRenderer } from './NumericInputRenderer'
import { SelectItemRenderer } from './SelectItemRenderer'
import { TextInputRenderer } from './TextInputRenderer'
import { TapTargetRenderer } from './TapTargetRenderer'

export type RendererProps = {
	puzzle: Puzzle
	disabled: boolean
	selectedValue: string | null
	onSelect: (value: string) => void
}

/**
 * Dispatch to the interaction-specific renderer.
 * Adding a new interactionType should only require a new renderer here.
 */
export function PuzzleInteractionRenderer(props: RendererProps) {
	const { puzzle } = props
	switch (puzzle.interactionType) {
		case 'multiple_choice':
			return (
				<MultipleChoiceRenderer
					puzzle={puzzle}
					disabled={props.disabled}
					selectedValue={props.selectedValue}
					onSelect={props.onSelect}
				/>
			)
		case 'numeric_input':
			return (
				<NumericInputRenderer
					puzzle={puzzle}
					disabled={props.disabled}
					selectedValue={props.selectedValue}
					onSelect={props.onSelect}
				/>
			)
		case 'select_item':
			return (
				<SelectItemRenderer
					puzzle={puzzle}
					disabled={props.disabled}
					selectedValue={props.selectedValue}
					onSelect={props.onSelect}
				/>
			)
		case 'text_input':
			return (
				<TextInputRenderer
					puzzle={puzzle}
					disabled={props.disabled}
					selectedValue={props.selectedValue}
					onSelect={props.onSelect}
				/>
			)
		case 'tap_target':
			return (
				<TapTargetRenderer
					puzzle={puzzle}
					disabled={props.disabled}
					selectedValue={props.selectedValue}
					onSelect={props.onSelect}
				/>
			)
		default: {
			return null
		}
	}
}
