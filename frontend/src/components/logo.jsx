import { cn } from '@/lib/utils'

export const Logo = ({
    className,
}) => {
    return (
        <img
            src="/concordia_logo_large.svg"
            alt="Concordia Logo"
            className={cn('h-8 w-auto', className)}
        />
    );
}

export const LogoIcon = ({
    className,
}) => {
    return (
        <img
            src="/concordia_logo_large.svg"
            alt="Concordia Logo"
            className={cn('size-8', className)}
        />
    );
}
