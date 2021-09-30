import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import { check, query, validationResult } from "express-validator";
import { filterImageFromURL, deleteLocalFiles } from "./util/util";
import { HTTP_STATUS } from "./common/types";
import { HTTP_MESSAGES } from "./common/messages";
import { existsSync } from "fs";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1

  // fetch and filter image from url
  app.get(
    "/filteredImage",
    [
      check('image_url').notEmpty().withMessage('image_url is required.'),
      check('image_url').isURL().withMessage('image_url must be a valid URL string.')
    ],
    async (req: Request, res: Response) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(HTTP_STATUS.UNPROCESSABLE).send({
          statusCode: HTTP_STATUS.UNPROCESSABLE,
          message: HTTP_MESSAGES.UNPROCESSABLE,
          errors: errors.mapped(),
        })
      }

      const { image_url } = req.query;

      try {
        const image = await filterImageFromURL(image_url);
        return res.sendFile(image, () => deleteLocalFiles([image]));
      } catch (e) {
        return res
          .status(HTTP_STATUS.SERVER_ERROR)
          .send({
            statusCode: HTTP_STATUS.SERVER_ERROR,
            message: HTTP_MESSAGES.SERVER_ERROR,
          });
      }
    }
  );

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();
