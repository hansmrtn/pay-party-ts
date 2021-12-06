import express, { Request, Response } from "express";
import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Party from "../models/parties";

export const partiesRouter = express.Router();

partiesRouter.use(express.json());

partiesRouter.get("/", async (_req: Request, res: Response) => {
  console.log("HERE");
  try {
    // Call find with an empty filter object, meaning it returns all documents in the collection. Saves as party array to take advantage of types
    const parties = (await collections.parties
      .find({})
      .toArray()) as unknown as Party[];

    res.status(200).send(parties);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Example route: http://localhost:8080/parties/610aaf458025d42e7ca9fcd0
partiesRouter.get("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    // _id in MongoDB is an objectID type so we need to find our specific document by querying
    const query = { _id: new ObjectId(id) };
    const party = (await collections.parties.findOne(
      query
    )) as unknown as Party;

    if (party) {
      res.status(200).send(party);
    }
  } catch (error) {
    res
      .status(404)
      .send(`Unable to find matching document with id: ${req.params.id}`);
  }
});

partiesRouter.post("/", async (req: Request, res: Response) => {
  try {
    const newParty = req.body as Party;
    const result = await collections.parties.insertOne(newParty);

    result
      ? res
          .status(201)
          .send(`Successfully created a new party with id ${result.insertedId}`)
      : res.status(500).send("Failed to create a new party.");
  } catch (error) {
    console.error(error);
    res.status(400).send(error.message);
  }
});

partiesRouter.put("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const updatedParty: Party = req.body as Party;
    const query = { _id: new ObjectId(id) };
    // $set adds or updates all fields
    const result = await collections.parties.updateOne(query, {
      $set: updatedParty,
    });

    result
      ? res.status(200).send(`Successfully updated party with id ${id}`)
      : res.status(304).send(`Party with id: ${id} not updated`);
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});

partiesRouter.delete("/:id", async (req: Request, res: Response) => {
  const id = req?.params?.id;

  try {
    const query = { _id: new ObjectId(id) };
    const result = await collections.parties.deleteOne(query);

    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed party with id ${id}`);
    } else if (!result) {
      res.status(400).send(`Failed to remove party with id ${id}`);
    } else if (!result.deletedCount) {
      res.status(404).send(`Party with id ${id} does not exist`);
    }
  } catch (error) {
    console.error(error.message);
    res.status(400).send(error.message);
  }
});
