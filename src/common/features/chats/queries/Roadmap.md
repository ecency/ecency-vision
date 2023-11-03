# How Chat queries and mutations works

## Queries

### General

- **Fetching the key pairs from stores properly**

  It will allow us to start all queries based on the chat authorization

  This query opens next ones:

  1. **Fetching direct contacts**

     It will allow us to fetch their last

  2. **Fetching last messages**
     1. Fetching direct contacts last messages
     2. Aggregate messages by users and fetching them by username properly

- **Searching users**

  This query doesn't require keys because it will search over Ecency
