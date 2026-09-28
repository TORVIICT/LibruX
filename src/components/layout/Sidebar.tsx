import { useState } from "react";
import "./Sidebar.scss";
import { useNavigate } from "react-router";

const navDicItems = {
  home: "Home",
  menu_book: "Books",
  bookmark_stacks: "My Loans",
  bookmarks: "Saved books",
};

const switchView = (view: string) => {
  switch (view) {
    case "Home":
      return "/dashboard";
    case "Books":
      return "/books";
    case "My Loans":
      return "/loans";
    case "Saved books":
      return "/saved-books";
    case "logout":
      return "/";
    default:
      return "/";
  }
};

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navegate = useNavigate();
  
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
            <button key={key} type="button" onClick={() => navegate(switchView(item))}>
              <span className="material-symbols-outlined">{key}</span>
              <p>{item}</p>
            </button>
          ))}
          <button type="button" onClick={() => navegate(switchView("logout"))}>
            <span className="material-symbols-outlined">logout</span>
            <p>Logout</p>
          </button>
        </nav>
      </div>
    </aside>
  );
};
