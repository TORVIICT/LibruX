import {useState} from "react";
import logo from "../../assets/Logo.png";
import "./Sidebar.scss";

const navItems = ["Home", "Books", "Services", "Contact"];

export const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <aside className={`sidebar ${isOpen ? "open" : ""}`}>
            <div className="inner">
                <header>
                    <button type="button" onClick={() => setIsOpen(!isOpen)}>
                        <span className="material...">
                            {isOpen ? "close" : "menu"}
                        </span>
                    </button>
                </header>
            </div>
        </aside>
    );
};