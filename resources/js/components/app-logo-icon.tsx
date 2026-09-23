import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 40 42"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            <path
                d="M7 36V6H14L26 25V6H33V36H26L14 17V36H7Z"
                fill="currentColor"
            />
        </svg>
    );
}