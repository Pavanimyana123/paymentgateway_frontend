import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentForm from "./components/PaymentForm";
import PaymentResult from "./components/PaymentResult";
import Transactions from './components/Transactions';
import CompanyProfile from './components/CompanyProfile';
import "bootstrap/dist/css/bootstrap.min.css";
import InstructionsPage from "./components/Instructions";
import Login from "./components/Login";

function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<Login />} />
        <Route path="/payment-form" element={<PaymentForm />} />
        <Route path="/payment-result" element={<PaymentResult />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/company-profile" element={<CompanyProfile />} />
        <Route path="/instructions" element={<InstructionsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
