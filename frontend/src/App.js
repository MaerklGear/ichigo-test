import { useState } from "react";
function App() {
  const [boxes, setBoxes] = useState([
    { class: "tokyotreat-box", backgroundColor: "#f87171" },
    { class: "japanhaul-box", backgroundColor: "#fef08a" },
    { class: "nomakenolife", backgroundColor: "#d9f99d" },
    { class: "tokyotreat-snacks", backgroundColor: "#fbbf24" },
    { class: "yumetwins-box", backgroundColor: "#10b981" },
    { class: "noodles", backgroundColor: "#ffe081" },
    { class: "tokyotreat-picknick", backgroundColor: "#22d3ee" },
    { class: "yumetwins-founder", backgroundColor: "#e879f9" },
    { class: "japanhaul-snacks-box", backgroundColor: "#f1f5f9" },
  ]);

  const handleClick = () => {
    setBoxes(boxes.map((box) => ({ ...box, backgroundColor: randomColor() })));
  };

  // Random Hex Color
  // from: https://css-tricks.com/snippets/javascript/random-hex-color/
  const randomColor = () => {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  };
  return (
    <main className="page">
      <div className="grid">
        {boxes &&
          boxes.map((box, index) => (
            <article
              style={{ backgroundColor: `${box.backgroundColor}` }}
              key={index}
              className={`card background-contain-center-no-repeat ${box.class}`}
              onClick={handleClick}
            >
              <span className="number">{index + 1}</span>
            </article>
          ))}
      </div>
    </main>
  );
}

export default App;
