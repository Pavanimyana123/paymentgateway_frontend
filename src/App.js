import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PaymentForm from "./components/PaymentForm";
import PaymentResult from "./components/PaymentResult";
import Transactions from './components/Transactions';
import CompanyProfile from './components/CompanyProfile';
import "bootstrap/dist/css/bootstrap.min.css";
import InstructionsPage from "./components/Instructions";
import Login from "./components/Login";
import SplitPayoutButton from "./components/SplitPayoutButton";
import SplitPayoutHistory from "./components/SplitPayoutHistory";
import CreateCustomer from "./components/CreateCustomer";
import CreatePlan from "./components/CreatePlan";
import CreateSubscription from "./components/CreateSubscription ";
import RazorpaySubscriptions from "./components/RazorpaySubscriptions ";
import Customers from "./components/Customers";
import Plans from "./components/Plans";

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
        <Route path="/splitbutton" element={<SplitPayoutButton />} />
         <Route path="/splitpayouts" element={<SplitPayoutHistory />} />
         <Route path="/create-customer" element={<CreateCustomer />} />
        <Route path="/create-plan" element={<CreatePlan />} />
        <Route path="/create-subscription" element={<CreateSubscription />} />
        <Route path="/subscriptions" element={<RazorpaySubscriptions />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/plans" element={<Plans />} />
      </Routes>
    </Router>
  );
}

export default App;
