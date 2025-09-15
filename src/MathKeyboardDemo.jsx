import React, { useEffect, useRef, useState } from "react";
import "mathlive";
import jsPDF from "jspdf";
import "katex/dist/katex.min.css";
import katex from "katex";

export default function MathKeyboardEditor() {
    const mathfieldRef = useRef(null);
    const [lines, setLines] = useState([]);
    const [text, setText] = useState("");

    useEffect(() => {
        if (mathfieldRef.current) {
            mathfieldRef.current.setAttribute("virtual-keyboard-mode", "onfocus");
            mathfieldRef.current.setAttribute("virtual-keyboard-theme", "apple");
            mathfieldRef.current.setAttribute("menu", "true");
        }

        if (window.mathVirtualKeyboard) {
            window.mathVirtualKeyboard.layouts = [
                "numeric",
                "symbols",
                "alphabetic",
                "greek",
            ];
            window.mathVirtualKeyboard.showToolbar = true;
        }
    }, []);

    const addEquation = () => {
        if (mathfieldRef.current) {
            const latex = mathfieldRef.current.value;
            if (latex.trim()) {
                setLines([...lines, { type: "math", value: latex }]);
                mathfieldRef.current.value = "";
            }
        }
    };

    const addText = () => {
        if (text.trim()) {
            setLines([...lines, { type: "text", value: text }]);
            setText("");
        }
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        let y = 20;

        lines.forEach((line) => {
            if (line.type === "text") {
                doc.text(line.value, 10, y);
                y += 10;
            } else if (line.type === "math") {
                // Render LaTeX to HTML string
                const html = katex.renderToString(line.value, {
                    throwOnError: false,
                });

                // Create a temporary div
                const tempDiv = document.createElement("div");
                tempDiv.innerHTML = html;
                document.body.appendChild(tempDiv);
                console.log(tempDiv);

                // Use jsPDF's html() API
                doc.html(tempDiv, {
                    x: 10,
                    y: y,
                    callback: () => {
                        doc.save("math-editor.pdf");
                    },
                });

                document.body.removeChild(tempDiv);
            }
        });

        // If only text exists
        if (!lines.some((l) => l.type === "math")) {
            doc.save("math-editor.pdf");
        }
    };

    return (
        <div style={{ padding: "20px" }}>
            <h2>Math + Text Editor</h2>

            {/* Math input */}
            <math-field
                ref={mathfieldRef}
                style={{
                    border: "1px solid #ccc",
                    padding: "8px",
                    fontSize: "20px",
                    minWidth: "300px",
                    display: "block",
                }}
            ></math-field>
            <button onClick={addEquation} style={{ marginTop: "10px" }}>
                ➕ Add Equation
            </button>

            {/* Text input */}
            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write explanation text..."
                style={{
                    marginTop: "20px",
                    width: "100%",
                    height: "80px",
                    padding: "8px",
                }}
            />
            <button onClick={addText} style={{ marginTop: "10px" }}>
                ➕ Add Text
            </button>

            {/* Preview */}
            <div style={{ marginTop: "20px" }}>
                <h3>Preview</h3>
                <div style={{ border: "1px solid #ddd", padding: "10px" }}>
                    {lines.map((line, i) =>
                        line.type === "text" ? (
                            <p key={i}>{line.value}</p>
                        ) : (
                            <p
                                key={i}
                                dangerouslySetInnerHTML={{
                                    __html: katex.renderToString(line.value, {
                                        throwOnError: false,
                                    }),
                                }}
                            />
                        )
                    )}
                </div>
            </div>

            {/* PDF button */}
            <button
                onClick={downloadPDF}
                style={{
                    marginTop: "20px",
                    padding: "10px 15px",
                    background: "green",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                }}
            >
                ⬇️ Download as PDF
            </button>
        </div>
    );
}
