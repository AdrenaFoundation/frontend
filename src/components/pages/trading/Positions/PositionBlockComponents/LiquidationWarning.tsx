interface LiquidationWarningProps {
    liquidable: boolean;
}

export const LiquidationWarning = ({ liquidable }: LiquidationWarningProps) => {
    if (!liquidable) return null;

    return (
        <div className="flex items-center justify-center pt-2 pb-2 border-t">
            <h2 className="text-red text-xs">Liquidable</h2>
        </div>
    );
};
