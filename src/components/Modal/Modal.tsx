import { useEffect, ReactNode, useState } from "react";
import { createPortal } from "react-dom";

import styles from "./Modal.module.scss";

// Create Portal container targetting specific id
export const PortalContainer = ({ children }: { children: ReactNode }) => {
    const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(
        null
    );

    useEffect(() => {
        // Look for container in the DOM
        const container = document.getElementById("modal-container");

        if (!container) {
            // Should never happens
            throw new Error("Portal container not found");
        }

        setPortalContainer(container);
    }, []);

    if (portalContainer === null) {
        return null;
    }

    return createPortal(children, portalContainer);
};

const Modal = ({
    title,
    children,
    close,
    className,
}: {
    title: string;
    children: ReactNode;
    close: () => void;
    className?: string;
}) => {
    useEffect(() => {
        const handler = (evt: KeyboardEvent) => {
            if (evt.key !== 'Escape')
                return;

            close();
        };

        window.addEventListener("keydown", handler);

        return () => window.removeEventListener("keydown", handler);
    }, []);

    return (
        <PortalContainer>
            <div className={styles.modalView}>
                <div
                    className={styles.modalView__background}
                    onClick={() => close()}
                />

                <div className={styles.modalView__window} role="dialog">
                    <div className={styles.modalView__header}>
                        <h4 className={styles.modalView__header_title}>{title}</h4>
                    </div>

                    <div className={`${styles.modalView__body} ${className ?? ''}`}>{children}</div>
                </div>
            </div>
        </PortalContainer>
    );
};

export default Modal;