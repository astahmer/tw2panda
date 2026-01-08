import { type VariantProps } from "class-variance-authority";
import { cn } from "#src/lib/utils.ts";
import type { ExposedComponentProps } from "./component-props.ts";
import { stack } from "./layout.styles";

export const Stack = (
	props: ExposedComponentProps<"div"> & VariantProps<typeof stack>,
) => {
	const { className, align, justifyContent, wrap, w, h, gap, direction, ...rest } =
		props;
	return (
		<div
			{...rest}
			className={cn(
				stack({
					direction: direction ?? "col",
					align,
					justifyContent,
					wrap,
					w,
					h,
					gap,
				}),
				className,
			)}
		/>
	);
};
export const HStack = (
	props: ExposedComponentProps<"div"> & VariantProps<typeof stack>,
) => {
	const { className, align, justifyContent, wrap, w, h, gap, direction, ...rest } =
		props;
	return (
		<div
			{...rest}
			className={cn(
				stack({
					direction: direction ?? "row",
					align,
					justifyContent,
					wrap,
					w,
					h,
					gap,
				}),
				className,
			)}
		/>
	);
};

export const FullCenter = (props: ExposedComponentProps<"div">) => {
	return (
		<div
			{...props}
			className={cn(
				"flex flex-col items-center justifyContent-center h-full",
				props.className,
			)}
		/>
	);
};

export { stack };
