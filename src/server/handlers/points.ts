import express from "express";
import axios from "axios";

export const pointsHandler = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    // Include the protocol (http://) in the URL
    const data = await axios.post("http://localhost:4000/user-info", req.body); // Pass req.body as the second argument
    res.send(data.data); // Send the response data from the backend
  } catch (e) {
    console.error(e);
    res.sendStatus(500); // Send a 500 status code for server errors
  }
};
