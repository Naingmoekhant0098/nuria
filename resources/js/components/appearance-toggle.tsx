import { Moon, Sun } from 'lucide-react';
import { useAppearance } from '@/hooks/use-appearance';

export function AppearanceToggle() {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    return (
        <div className="flex rounded-lg border bg-background p-1" aria-label="Color theme">
            <button
                type="button"
                onClick={() => updateAppearance('light')}
                aria-label="Use light theme"
                aria-pressed={resolvedAppearance === 'light'}
                className={`flex size-8 items-center justify-center rounded-md transition ${resolvedAppearance === 'light' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
                <Sun className="size-4" />
            </button>
            <button
                type="button"
                onClick={() => updateAppearance('dark')}
                aria-label="Use dark theme"
                aria-pressed={resolvedAppearance === 'dark'}
                className={`flex size-8 items-center justify-center rounded-md transition ${resolvedAppearance === 'dark' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
            >
                <Moon className="size-4" />
            </button>
        </div>
    );
}
