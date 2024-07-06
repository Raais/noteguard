import "./Auth.css";

import { FC, useContext, useEffect, useState } from "react";
import { combine, generateKey, sha256, split, stringToName } from "./slip39";

import { useNavigate } from "react-router-dom";
import AuthContext from "./AuthContext";

const Authenticate = () => {
  const [showKey, setShowKey] = useState(false);
  const [showInputs, setShowInputs] = useState(false);
  const [totalShares, setTotalShares] = useState(1);
  const [threshold, setThreshold] = useState(1);
  const [mnemonics, setMnemonics] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [importedText, setImportedText] = useState("");

  const hexKey = useContext(AuthContext).hexKey;
  const setHexKey = useContext(AuthContext).setHexKey;
  const keyName = useContext(AuthContext).keyName;
  const setKeyName = useContext(AuthContext).setKeyName;

  const navigate = useNavigate();

  useEffect(() => {
    if (hexKey || keyName) {
      navigate("/auth/flow");
    }
  }, [navigate]);

  useEffect(() => {
    importedText.trim() !== "" && handleCombine();
  }, [importedText]);

  const handleGenerateKey = async (bits: number) => {
    const key = await generateKey(bits);
    setHexKey && setHexKey(key);
    const hash = await sha256(key);
    setKeyName && setKeyName(stringToName(hash));
    const mnemonicShares = split(key, totalShares, threshold);
    //@ts-expect-error
    setMnemonics(mnemonicShares);
    setIsModalOpen(true);
  };

  const handleCopy = () => {
    hexKey &&
      navigator.clipboard.writeText(hexKey).then(
        () => {
          alert("Private key copied");
        },
        () => {
          console.warn("Failed to copy key.");
        }
      );
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setMnemonics([]);
    hexKey && keyName && navigate("/auth/flow");
  };

  const handleCheckboxChange = () => {
    setShowInputs(!showInputs);
  };

  const handleTextareaChange = (event: any) => {
    setImportedText(event.target.value);
  };

  const handleFileUpload = (event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      e.target?.result &&
        setImportedText(importedText + e.target.result + "\n");
      event.target.value = null;
    };
    reader.readAsText(file);
  };

  const handleCombine = async () => {
    if (importedText.trim() !== "") {
      const mnemonicShares = importedText.trim().split("\n");
      let fail = false;
      mnemonicShares.forEach((mnemonic, index) => {
        const words = mnemonic.split(" ");
        if (words.length !== 33) {
          fail = true;
          console.error(`Invalid mnemonic at line ${index + 1}`);
        }
      });
      if (fail) return;
      const key = combine(mnemonicShares);
      setHexKey && setHexKey(key);
      const hash = await sha256(key);
      setKeyName && setKeyName(stringToName(hash));
      setImportedText("");
      key && hash && navigate("/auth/flow");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white mx-8 md:mx-auto md:w-auto shadow sm:rounded-lg sm:p-10">
          <h1 className="text-center text-3xl font-bold text-gray-700 mb-8">
            Authenticate
          </h1>
          <div className="flex justify-center space-x-4 mb-3">
            <button
              onClick={() => handleGenerateKey(256)}
              className="px-6 py-3 glow-hover bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Generate secure key
            </button>
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showInputs}
                onChange={handleCheckboxChange}
                className={`mr-1 rounded text-xs ${!showInputs ? `opacity-35 hover:opacity-70` : `opacity-100`}`}
              />
              <span
                className={`text-xs ${!showInputs ? `text-gray-300 hover:text-gray-400` : `text-gray-700`}`}
              >
                s &gt; t
              </span>
            </label>
            {showInputs && (
              <div className="flex items-center justify-center space-x-1">
                <div className="flex items-center">
                  <input
                    type="number"
                    value={totalShares}
                    onChange={(e) => setTotalShares(Number(e.target.value))}
                    min="1"
                    className="px-2 text-xs py-1 w-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="number"
                    value={threshold}
                    onChange={(e) => setThreshold(Number(e.target.value))}
                    min="1"
                    className="px-2 text-xs py-1 w-8 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>
          <hr className="my-2" />

          <p className="text-xs text-gray-200 mb-1">Import secrets?</p>
          <div className="flex justify-center space-x-2 mb-4">
            <textarea
              value={importedText}
              onChange={handleTextareaChange}
              spellCheck="false"
              style={{
                color: "transparent",
                textShadow: "0 0 5px rgba(0,0,0,0.6)",
              }}
              className="flex-1 text-xs px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-center space-x-2 mb-4">
            <label className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
              + File
              <input
                type="file"
                accept="*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
            <label className="flex items-center px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer">
              Import
              <button className="hidden" onClick={handleCombine} />
            </label>
          </div>
        </div>
      </div>
      {hexKey && keyName && (
        <Modal
          isOpen={isModalOpen}
          closeModal={closeModal}
          mnemonics={mnemonics}
          hexKey={hexKey}
          keyName={keyName}
          handleCopy={handleCopy}
          showKey={showKey}
          setShowKey={setShowKey}
        />
      )}
    </div>
  );
};

const Modal: FC<any> = ({
  isOpen,
  closeModal,
  mnemonics,
  hexKey,
  keyName,
  handleCopy,
  showKey,
  setShowKey,
}) => {
  if (!isOpen) return null;

  const downloadMnemonic = (mnemonic: string) => {
    const timestamp = Date.now();
    const filename = `${timestamp}.txt`;
    const blob = new Blob([mnemonic], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.addEventListener("click", () => {
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
        link.remove();
      }, 500);
    });
    link.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none bg-black bg-opacity-50">
      <div className="relative w-full max-w-lg mx-auto my-6 max-h-full overflow-y-auto">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t">
            <span className="text-xl font-semibold noselect">
              Don't share with anyone!
            </span>
            <span className="text-xs text-gray-400 noselect">{`{ ${keyName} }`}</span>
          </div>
          <div className="relative p-6 flex-auto overflow-y-auto max-h-96">
            <div className="list-disc list-inside">
              {mnemonics.map((mnemonic: any, index: any) => (
                <div key={index}>
                  <p className="text-sm mb-2">
                    {mnemonic.split(" ").map((word: any, wordIndex: any) => (
                      <span key={wordIndex}>
                        <span className="highlight">{word}</span>{" "}
                      </span>
                    ))}
                  </p>
                  <button
                    className="px-1 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={() => downloadMnemonic(mnemonic)}
                  >
                    <svg
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                      height="1em"
                      width="1em"
                    >
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                  </button>
                  <hr className="my-4" />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="flex items-center mb-2 float-right">
                <input
                  type="checkbox"
                  checked={showKey}
                  onChange={(e) => setShowKey(e.target.checked)}
                  className="mr-1 rounded"
                />
                <span className="text-xs text-gray-400 noselect">key</span>
              </label>
              {showKey ? (
                <div id="key-div">
                  <p className="text-xs text-gray-300 mb-3 noselect">
                    Your seed phrases are used to produce this 256-bit private
                    key.
                  </p>
                  <input
                    id="hex-key"
                    disabled
                    spellCheck="false"
                    style={{
                      color: "transparent",
                      textShadow: "0 0 4.5px rgba(0,0,0,0.4)",
                    }}
                    value={hexKey}
                    readOnly
                    onCopy={(e) => e.preventDefault()}
                    onCut={(e) => e.preventDefault()}
                    onPaste={(e) => e.preventDefault()}
                    className="w-full px-4 py-3 border-1 border-gray-500 hover:border-red-400 border-opacity-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleCopy}
                    className="mt-1 noselect text-gray-200 float-right text-xs hover:underline hover:text-red-400 focus:outline-none"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <div className="flex space-x-1">

                <p className="text-xs text-gray-400 noselect">
                  Save these seed words securely. They are not recoverable.
                </p>
                <a className="text-xs text-blue-500 hover:underline noselect" href="https://github.com/satoshilabs/slips/blob/master/slip-0039.md" target="_blank" rel="noreferrer">
                SLIP39
                </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-end p-4 border-t border-solid border-gray-300 rounded-b">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={closeModal}
            >
              I have saved it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Authenticate;
