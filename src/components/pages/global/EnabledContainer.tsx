interface EnabledContainerProps {
    enabled: boolean;
    children: React.ReactNode;
}

export function EnabledContainer({ enabled, children }: EnabledContainerProps) {
    if (!enabled) return null;
    return <>{children}</>;
}
