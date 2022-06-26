import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

function Section({ children, headerText }) {
  return (
    <div className="section">
      <div className="section-container">
        {headerText && <h2 className="section-header">{headerText}</h2>}
        {children}
      </div>
    </div>
  );
}

export default Section;
