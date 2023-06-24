import { gemoji, nameToEmoji } from 'gemoji';

export const REACTIONS = ['+1', '-1', 'confused', 'eyes', 'heart', 'hooray', 'laugh', 'rocket'] as const;
export type ElemOf<T> = T extends readonly (infer E)[] ? E : T extends (infer E)[] ? E : T;

export function emoji(reaction: ElemOf<typeof REACTIONS>): string {
	return nameToEmoji[reaction] || gemoji.find(({ tags }) => tags.includes(reaction))!.emoji;
}

