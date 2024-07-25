import React from "react";
import { InlineMath, BlockMath } from "react-katex";

import "./Styles.css";

const Equation = ({ attributes, element, children }) => {
  const { inline, math } = element;
  return (
    <div className={inline ? "equation-inline" : ""}>
      <span {...attributes} {...element.attr}>
        <span contentEditable={false}>
          {inline ? <InlineMath math={math} /> : <BlockMath math={math} />}
        </span>
        {children}
      </span>
    </div>
  );
};

export default Equation;
