import { useState } from "react";
import "./Sidebar.scss";

const navDicItems = {
  home: "Home",
  menu_book: "Books",
  bookmark_stacks: "My Loans",
  bookmarks: "Saved books",
};

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <aside className={`sidebar ${isOpen ? "open" : ""}`}>
      <div className="inner">
        <header>
          <button
            type="button"
            className="sidebar-burger"
            onClick={() => setIsOpen(!isOpen)}
          >
            <span className="material-symbols-outlined">
              {isOpen ? "close" : "menu"}
            </span>
          </button>
  
          <span className="sidebar-title">Librux</span>
        </header>
        <nav>
          {Object.entries(navDicItems).map(([key, item]) => (
            <button key={key} type="button">
              <span className="material-symbols-outlined">{key}</span>
              <p>{item}</p>
            </button>
          ))}
          <button type="button">
            <span className="material-symbols-outlined">settings</span>
            <p>Settings</p>
          </button>
        </nav>
      </div>
    </aside>
  );
};
