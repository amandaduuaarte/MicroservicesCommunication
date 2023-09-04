# Project: Communication between Microservices

Repository containing the project developed to study Communication between Microservices.

## Technologies

* **Java 11**
* **Spring Boot 2**
* **Javascript ES6**
* **Node.js**
* **ES6 Modules**
* **Express.js**
* **MongoDB (Container e Cloud MongoDB)**
* **API REST**
* **PostgreSQL (Container)**
* **RabbitMQ (Container e CloudAMQP)**
* **Docker**
* **docker-compose**
* **JWT**
* **Axios**

![Arquitetura Proposta](https://github.com/amandaduuaarte/MicroservicesCommunication/assets/89158507/bb4b2dbc-a4fd-4381-8c63-dcfccf016181)


## API Logs and Tracing

All endpoints need a header called **transactionid**, as it will represent the ID that will go through the entire request in the service, and, if this application calls other microservices, this **transactionid** will be passed on. All input and output endpoints will log the input data (JSON or parameters) and the **transactionid**.

With each request for each microservice, we will have a **serviceid** attribute generated just for the logs of that service itself. We will then have the **transactionid** that will circulate among all the microservices involved in the request, and each microservice will have its own **serviceid**.

Tracing flow in requests:

**POST** - **/api/order** with **transactionid**: ef8347eb-2207-4610-86c0-657b4e5851a3

```
service-1:
transactionid: ef8347eb-2207-4610-86c0-657b4e5851a3
serviceid    : 6116a0f4-6c9f-491f-b180-ea31bea2d9de
|
| HTTP Request
|----------------> service-2:
                   transactionid: ef8347eb-2207-4610-86c0-657b4e5851a3
                   serviceid    : 4e1261c1-9a0c-4a5d-bfc2-49744fd159c6
                   |
                   | HTTP Request
                   |----------------> service-3: /api/check-stock
                                      transactionid: ef8347eb-2207-4610-86c0-657b4e5851a3
                                      serviceid    : b4fbc082-a49a-440d-b1d6-2bd0557fd189
```
As we can see in the flow above, the **transactionid** ef8347eb-2207-4610-86c0-657b4e5851a3 remained the same in the 3 services, and each service has
your own **serviceid**.

Example of a complete flow calling 5 services and generating **transactionid** and **serviceid**:

![Tracing](https://github.com/amandaduuaarte/MicroservicesCommunication/assets/89158507/998fdb2e-91e1-47b0-bf13-7d86818a1c53)


Example of logs in the developed APIs:

Auth-API:

```
Request to POST login with data {"email":"testeuser1@gmail.com","password":"123456"} | [transactionID: e3762030-127a-4079-9dee-ba961d7e77ce | serviceID: 6b07b6c2-009e-4799-be96-3bf972338b17]

Response to POST login with data {"status":200,"accessToken":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdXRoVXNlciI6eyJpZCI6MSwibmFtZSI6IlVzZXIgVGVzdCAxIiwiZW1haWwiOiJ0ZXN0ZXVzZXIxQGdtYWlsLmNvbSJ9LCJpYXQiOjE2MzQwNTE4ODQsImV4cCI6MTYzNDEzODI4NH0.NJ-h2i5XPT8NwZyZ_43bif1NIS00ROfCtRecBkxy5A8"} | [transactionID: e3762030-127a-4079-9dee-ba961d7e77ce | serviceID: 6b07b6c2-009e-4799-be96-3bf972338b17]
```

Product-API:

```
Request to POST product stock with data {"products":[{"productId":1001,"quantity":1},{"productId":1002,"quantity":1},{"productId":1003,"quantity":1}]} | [transactionID: 8817508e-805c-48fb-9cb4-6a1e5a6e71e9 | serviceID: ea146e74-55cf-4a53-860e-9010d6e3f61b]

Response to POST product stock with data {"status":200,"message":"The stock is ok!"} | [transactionID: 8817508e-805c-48fb-9cb4-6a1e5a6e71e9 | serviceID: ea146e74-55cf-4a53-860e-9010d6e3f61b]
```

Sales-API:

```
Request to POST new order with data {"products":[{"productId":1001,"quantity":1},{"productId":1002,"quantity":1},{"productId":1003,"quantity":1}]} | [transactionID: 8817508e-805c-48fb-9cb4-6a1e5a6e71e9 | serviceID: 5f553f02-e830-4bed-bc04-8f71fe16cf28]

Response to POST login with data {"status":200,"createdOrder":{"products":[{"productId":1001,"quantity":1},{"productId":1002,"quantity":1},{"productId":1003,"quantity":1}],"user":{"id":1,"name":"User Test 1","email":"testeuser1@gmail.com"},"status":"PENDING","createdAt":"2021-10-12T16:34:49.778Z","updatedAt":"2021-10-12T16:34:49.778Z","transactionid":"8817508e-805c-48fb-9cb4-6a1e5a6e71e9","serviceid":"5f553f02-e830-4bed-bc04-8f71fe16cf28","_id":"6165b92addaf7fc9dd85dad0","__v":0}} | [transactionID: 8817508e-805c-48fb-9cb4-6a1e5a6e71e9 | serviceID: 5f553f02-e830-4bed-bc04-8f71fe16cf28]
```

RabbitMQ:

```
Sending message to product update stock: {"salesId":"6165b92addaf7fc9dd85dad0","products":[{"productId":1001,"quantity":1},{"productId":1002,"quantity":1},{"productId":1003,"quantity":1}],"transactionid":"8817508e-805c-48fb-9cb4-6a1e5a6e71e9"}

Recieving message with data: {"salesId":"6165b92addaf7fc9dd85dad0","products":[{"productId":1001,"quantity":1},{"productId":1002,"quantity":1},{"productId":1003,"quantity":1}],"transactionid":"8817508e-805c-48fb-9cb4-6a1e5a6e71e9"} and TransactionID: 8817508e-805c-48fb-9cb4-6a1e5a6e71e9

Sending message: {"salesId":"6165b92addaf7fc9dd85dad0","status":"APPROVED","transactionid":"8817508e-805c-48fb-9cb4-6a1e5a6e71e9"}

Recieving message from queue: {"salesId":"6165b92addaf7fc9dd85dad0","status":"APPROVED","transactionid":"8817508e-805c-48fb-9cb4-6a1e5a6e71e9"}
```


## Docker commands

Below are some of the commands executed during development to create containers.
from PostgreSQL, MongoDB and RabbitMQ message broker databases:

#### Container Auth-DB

`docker run --name auth-db -p 5432:5432 -e POSTGRES_DB=auth-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=123456 postgres:11`

#### Container Product-DB

`docker run --name product-db -p 5433:5432 -e POSTGRES_DB=product-db -e POSTGRES_USER=admin -e POSTGRES_PASSWORD=123456 postgres:11`

#### Container Sales-DB

`docker run --name sales-db -p 27017:27017 -p 28017:28017 -e MONGODB_USER="admin" -e MONGODB_DATABASE="sales" -e MONGODB_PASS="123456" -v  c:/db tutum/mongodb`

#### Connection in Mongoshell

`mongo "mongodb://admin:123456@localhost:27017/sales"`

#### Container RabbitMQ

`docker run --name sales_rabbit -p 5672:5672 -p 25676:25676 -p 15672:15672 rabbitmq:3-management`

### Run docker-compose

`docker-compose up --build`

To ignore the logs, add the `-d` flag.

## Contributing
To contribute to the project, please feel free to contact me. You can reach me through the following channels:

-   GitHub: <a href="https://github.com/amandaduuaarte">Amanda Duarte</a>

I would be happy to discuss any ideas, suggestions, or contributions you have in mind. Thank you for your interest in contributing to the project!
 <div align="center">
  <br/>
  <br/>
  <br/>
    <div>
      <sub>Copyright © 2023 - <a href="https://github.com/amandaduuaarte">Amanda Duarte</sub></a>
    </div>
    <br/>
    💖
</div>

