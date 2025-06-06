import { useEffect, useState } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function AdminWhitelistPage() {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const navigate = useNavigate();

  // Decode token and get user email
  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded?.email) {
          setUserEmail(decoded.email);
        }
      } catch (err) {
        console.error("Failed to decode token", err);
      }
    }
  }, []);

  // Fetch whitelist and check admin
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await axios.get("/api/whitelist");
        const user = res.data.find(
          (u) => u.email.toLowerCase() === userEmail?.toLowerCase() && u.isAdmin
        );
        if (user) {
          setIsAdmin(true);
        } else {
          navigate("/"); // Redirect non-admins
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        navigate("/");
      }
    };

    if (userEmail) {
      checkAdmin();
    }
  }, [userEmail, navigate]);

  const fetchEmails = async () => {
    try {
      const res = await axios.get("/api/whitelist");
      setEmails(res.data.map((e) => e.email));
    } catch (err) {
      console.error("Error fetching whitelist:", err);
    }
  };

  const handleAdd = async () => {
    try {
      await axios.post("/api/whitelist", { email: newEmail });
      setNewEmail("");
      fetchEmails();
    } catch (err) {
      console.error("Failed to add email:", err);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchEmails();
    }
  }, [isAdmin]);

  if (!isAdmin) {
    return null; // Or show loading/spinner if you'd like
  }

  return (
    <Wrapper>
      <h2>Manage Whitelist</h2>
      <InputGroup>
        <input
          type="email"
          placeholder="Enter new email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <button onClick={handleAdd}>Add</button>
      </InputGroup>
      <EmailList>
        {emails.map((email) => (
          <li key={email}>{email}</li>
        ))}
      </EmailList>
    </Wrapper>
  );
}