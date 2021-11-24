import React, { useEffect } from "react";
import { Link, Router, useHistory } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const history = useHistory();
  const [roomName, setRoomName] = React.useState("");
  const [members, setMembers] = React.useState();
  const [steps, setSteps] = React.useState({
    step1: true,
    step2: false,
    step3: false,
  });
  const [name, setName] = React.useState("");
  const handleRoomNameChange = (event) => {
    setRoomName(event.target.value);
  };
  const handleName = (event) => {
    setName(event.target.value);
  };
  const handleFetch = () => {
    fetch("/public")
      .then((res) => res.json())
      .then((data) => {
        localStorage.setItem(name, JSON.stringify(data));
        localStorage.getItem("members")
          ? localStorage.setItem(
              "members",
              JSON.stringify([
                ...JSON.parse(localStorage.getItem("members")),
                name,
              ])
            )
          : localStorage.setItem("members", JSON.stringify([name]));
        setSteps({ ...setSteps, step1: false, step2: true });
      });
  };

  const sendtoAPI = (key, data) => {
    console.log(key);
    fetch(`http://localhost:4000/createKey`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ key, secret: data }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        localStorage.setItem("symkey", data.symKey);
      });
  };

  const handleStart = () => {
    const data = "my secret data";
    if (localStorage.getItem("symkey")) {
      history.push("/:chat");
      let pk = JSON.parse(localStorage.getItem(name)).privateKey;
      fetch("http://localhost:4000/decrypt", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          key: pk,
          secret: localStorage.getItem("symkey"),
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          localStorage.setItem("secret", data);
        });
    } else {
      localStorage.setItem("secret", data);
      if (JSON.parse(localStorage.getItem("members"))?.length > 1) {
        let members = JSON.parse(localStorage.getItem("members"));

        let receiver = members?.filter((item) => item !== name);
        let publicKey = JSON.parse(localStorage.getItem(receiver[0])).publicKey;
        console.log(publicKey);

        sendtoAPI(publicKey, data);
      } else {
        console.log("No receiver");
      }
    }
  };

  return (
    <div className="home-container">
      {steps.step1 && (
        <>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={handleName}
            className="text-input-field"
          />
          <div className="enter-room-button" onClick={handleFetch}>
            Get Keys
          </div>
        </>
      )}
      {steps.step2 && (
        <div className="enter-room-button" onClick={handleStart}>
          Start chat
        </div>
      )}

      {/* <input
        type="text"
        placeholder="Room"
        value={roomName}
        onChange={handleName}
        className="text-input-field"
      />
      <Link to={`/${roomName}`} className="enter-room-button">
        Join room
      </Link> */}
    </div>
  );
};

export default Home;
