import { cva } from "class-variance-authority";

export const stack = cva("flex", {
	variants: {
		direction: {
			row: "flex-row",
			col: "flex-col",
		},
		align: {
			center: "items-center",
			start: "items-start",
			end: "items-end",
			selfStart: "self-start",
			selfCenter: "self-center",
			selfEnd: "self-end",
		},
		justifyContent: {
			center: "justify-center",
			start: "justify-start",
			end: "justify-end",
			between: "justify-between",
			around: "justify-around",
		},
		wrap: {
			true: "flex-wrap",
		},
		w: {
			full: "w-full",
		},
		h: {
			full: "h-full",
		},
		gap: {
			"0": "gap-0",
			"1": "gap-1",
			"2": "gap-2",
			"3": "gap-3",
			"4": "gap-4",
			"5": "gap-5",
			"6": "gap-6",
			"7": "gap-7",
			"8": "gap-8",
			"9": "gap-9",
			"10": "gap-10",
			"11": "gap-11",
			"12": "gap-12",
		},
	},
	defaultVariants: {
		direction: "col",
		gap: "2",
		// align: "center",
	},
});
