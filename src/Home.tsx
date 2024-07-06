import "quill/dist/quill.snow.css";
import "./App.css";

import React, { useContext, useEffect, useRef } from "react";
import {
  useQueries,
  useResultTable,
  useStore,
  useValue,
} from "tinybase/debug/ui-react";

import { decryptBlob } from "kiss-crypto";
import { useHotkeys } from "react-hotkeys-hook";
import { useQuill } from "react-quilljs";
import { useLocation, useNavigate } from "react-router-dom";
import ReactTimeAgo from "react-time-ago";
import { StoreInspector } from "tinybase/debug/ui-react-dom";
import AuthContext from "./auth/AuthContext";
import { exportDb, useSqlite3 } from "./lib/db/DB";
import {
  cmd_addNote,
  cmd_editNote,
  cmd_removeNote,
} from "./lib/db/models/notes";
import { cmd_setOpened } from "./lib/db/models/values";
import { usePersister } from "./lib/PersisterContext";
import { castToArray } from "./lib/utils";

const Home = () => {
  const { hexKey, keyName, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== "/") {
      navigate("/", { replace: true });
    }
  }, [location]);

  if (!hexKey || !keyName || !logout) return;

  const store = useStore();
  const queries = useQueries();

  const {
    sqlite3Persister,
    sqlite3Instance,
    setSqlite3Persister,
    setSqlite3Instance,
  } = usePersister();

  if (
    !store ||
    !queries ||
    !sqlite3Persister ||
    !sqlite3Instance ||
    !setSqlite3Persister ||
    !setSqlite3Instance
  )
    return;

  const notes = castToArray(useResultTable("getNotes"));

  const opened = useValue("opened");

  const openedNote = notes.find((note) => note.id === opened) ||
    notes[0] || { id: -1, content: "" };

  if (notes === undefined) return;

  const untitled = "<h1><strong>Untitled</strong></h1><p></p><p></p><p></p>";

  const fileUpload = useRef(null);
  const clickUpload = () => {
    // @ts-ignore
    fileUpload.current && fileUpload.current.click();
  };

  useHotkeys("alt+n", () => cmd_addNote(store, untitled), {
    preventDefault: true,
  });
  useHotkeys("alt+o", () => clickUpload(), { preventDefault: true });
  useHotkeys(
    "alt+x",
    () => exportDb(sqlite3Persister, sqlite3Instance, hexKey, logout),
    { preventDefault: true }
  );

  const { quill, quillRef } = useQuill({
    theme: "snow",
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline"],
        [{ list: "bullet" }],
        ["link"],
      ],
    },
    formats: ["header", "bold", "italic", "underline", "list", "link"],
  });

  useEffect(() => {
    if (quill) {
      quill.on("text-change", (_delta, _oldDelta, source) => {
        if (source === "user" && openedNote.id === store.getValue("opened")) {
          cmd_editNote(store, openedNote.id, quill.getSemanticHTML());
        }
      });

      const delta = quill.clipboard.convert({ html: openedNote.content });
      quill.setContents(delta, "api");
      quill.setSelection(quill.getLength(), 0);
    }
  }, [quill, openedNote.id, sqlite3Persister.getDb()]);

  const getTitle = (contents: string): string => {
    if (!quill) return "";
    const delta = quill.clipboard.convert({ html: contents });
    return delta.ops.length > 0 ? (delta.ops[0].insert as string) : "";
  };

  const getStringSize = (str: string) => {
    return new TextEncoder().encode(str).length / 1024;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      const encryptedBlob = new Uint8Array(e.target?.result as ArrayBuffer);
      let decryptedBlob;
      try {
        decryptedBlob = await decryptBlob({
          key: hexKey,
          cipherblob: encryptedBlob,
        });
      } catch (e) {
        alert("Failed to decrypt. Invalid key or file.");
        return;
      }
      if (!decryptedBlob) return;
      await useSqlite3(
        sqlite3Persister,
        setSqlite3Persister,
        sqlite3Instance,
        setSqlite3Instance,
        store,
        decryptedBlob.buffer
      );
    };
  };

  return (
    <>
      <div className="min-h-screen bg-gray-100 flex">
        {/* Left sidebar */}
        <aside className="w-64 bg-white flex flex-col p-3 h-screen overflow-y-scroll overflow-x-hidden">
          <div className="flex space-x-2 items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-700 mb-4 ml-2">Box</h2>
            <button
              className="flex items-center justify-center p-0 bg-transparent cursor-pointer mb-4"
              onClick={() => cmd_addNote(store, untitled)}
            >
              <svg
                width="40px"
                height="40px"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-blue-200 text-xl hover:text-blue-400 transition-colors duration-100"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M7 2C4.23858 2 2 4.23858 2 7V17C2 19.7614 4.23858 22 7 22H17C19.7614 22 22 19.7614 22 17V7C22 4.23858 19.7614 2 17 2H7ZM12 7C12.5523 7 13 7.44772 13 8V11H16C16.5523 11 17 11.4477 17 12C17 12.5523 16.5523 13 16 13H13V16C13 16.5523 12.5523 17 12 17C11.4477 17 11 16.5523 11 16V13H8C7.44772 13 7 12.5523 7 12C7 11.4477 7.44772 11 8 11H11V8C11 7.44772 11.4477 7 12 7Z"
                  fill="currentColor"
                />
              </svg>
            </button>
          </div>
          <ul className="space-y-1">
            {notes.map((note, index) => (
              <li
                key={index}
                className={` text-gray-600 text-sm font-medium p-2 ml-3 nudge-animation rounded-lg hover:bg-blue-200 transition-colors cursor-pointer ${note.id === openedNote.id ? "bg-blue-200" : ""}`}
                onClick={() => cmd_setOpened(store, notes[index].id)}
              >
                {getTitle(note.content)}
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1 flex flex-col">
          {/* Top navigation */}
          <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center shadow-lg">
            <div className="text-2xl font-bold">NoteGuard</div>

            <div className="flex space-x-4">
              <button
                className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white flex items-center space-x-1"
                onClick={() =>
                  exportDb(sqlite3Persister, sqlite3Instance, hexKey, logout)
                }
              >
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ffffff"
                >
                  <path
                    d="M7 10.0288C7.47142 10 8.05259 10 8.8 10H15.2C15.9474 10 16.5286 10 17 10.0288M7 10.0288C6.41168 10.0647 5.99429 10.1455 5.63803 10.327C5.07354 10.6146 4.6146 11.0735 4.32698 11.638C4 12.2798 4 13.1198 4 14.8V16.2C4 17.8802 4 18.7202 4.32698 19.362C4.6146 19.9265 5.07354 20.3854 5.63803 20.673C6.27976 21 7.11984 21 8.8 21H15.2C16.8802 21 17.7202 21 18.362 20.673C18.9265 20.3854 19.3854 19.9265 19.673 19.362C20 18.7202 20 17.8802 20 16.2V14.8C20 13.1198 20 12.2798 19.673 11.638C19.3854 11.0735 18.9265 10.6146 18.362 10.327C18.0057 10.1455 17.5883 10.0647 17 10.0288M7 10.0288V8C7 5.23858 9.23858 3 12 3C14.7614 3 17 5.23858 17 8V10.0288"
                    stroke="#ffffff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>Lock</span>
              </button>

              <label className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white flex items-center space-x-1">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  stroke="#ffffff"
                >
                  <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                  <g
                    id="SVGRepo_tracerCarrier"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  ></g>
                  <g id="SVGRepo_iconCarrier">
                    <path
                      d="M15 9H15.01M15 15C18.3137 15 21 12.3137 21 9C21 5.68629 18.3137 3 15 3C11.6863 3 9 5.68629 9 9C9 9.27368 9.01832 9.54308 9.05381 9.80704C9.11218 10.2412 9.14136 10.4583 9.12172 10.5956C9.10125 10.7387 9.0752 10.8157 9.00469 10.9419C8.937 11.063 8.81771 11.1823 8.57913 11.4209L3.46863 16.5314C3.29568 16.7043 3.2092 16.7908 3.14736 16.8917C3.09253 16.9812 3.05213 17.0787 3.02763 17.1808C3 17.2959 3 17.4182 3 17.6627V19.4C3 19.9601 3 20.2401 3.10899 20.454C3.20487 20.6422 3.35785 20.7951 3.54601 20.891C3.75992 21 4.03995 21 4.6 21H6.33726C6.58185 21 6.70414 21 6.81923 20.9724C6.92127 20.9479 7.01881 20.9075 7.10828 20.8526C7.2092 20.7908 7.29568 20.7043 7.46863 20.5314L12.5791 15.4209C12.8177 15.1823 12.937 15.063 13.0581 14.9953C13.1843 14.9248 13.2613 14.8987 13.4044 14.8783C13.5417 14.8586 13.7588 14.8878 14.193 14.9462C14.4569 14.9817 14.7263 15 15 15Z"
                      stroke="#ffffff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </g>
                </svg>
                <span className="text-sm text-white">Open .box</span>
                <input
                  type="file"
                  ref={fileUpload}
                  className="hidden"
                  onChange={handleUpload}
                />
              </label>

              <div className="relative group">
                <button className="bg-blue-700 hover:bg-blue-800 text-white py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-600 focus:ring-white">
                  {`{ ${keyName} }`}
                </button>
                <div className="absolute right-2 w-36 mt-2 bg-white rounded-md shadow-md hidden group-focus-within:block transition-opacity duration-100 z-10">
                  <ul className="py-1">
                    <button
                      className="block px-4 py-2 text-red-400 hover:text-red-600 cursor-pointer"
                      onClick={() => {
                        logout();
                      }}
                    >
                      Logout
                    </button>
                  </ul>
                </div>
              </div>
            </div>
          </nav>

          {/* Main content */}
          <main className="flex-1 p-6 overflow-auto">
            <div
              className={`bg-white p-8 rounded-lg shadow-md ${notes.length < 1 && "invisible"}`}
            >
              <div className="editor-cont text-lg text-gray-700 flex-reverse w-full border-2 border-gray-300 rounded-lg focus:outline-none">
                <div ref={quillRef} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-300 mt-2">
                  <ReactTimeAgo
                    date={new Date(openedNote.id * 1000)}
                    locale="en-US"
                  />
                  {` | ${getStringSize(openedNote.content).toFixed(2)} kB`}
                </span>
                <button
                  className="border-2 border-white hover:border-red-500 text-red-400 hover:text-red-500 font-medium text-xs py-2 px-4 rounded-lg focus:outline-none mt-4"
                  onClick={() => cmd_removeNote(store, openedNote.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
      <StoreInspector />
    </>
  );
};

export default Home;
