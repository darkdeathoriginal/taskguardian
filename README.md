
# TaskGuardian

Task Guardian is a simple task manager API that allows users to create, update, and delete tasks. Users can also assign tasks to other users and update the status of tasks. The API is secured using JWT tokens and has role-based access control.


## Features

- Create tasks with a title, description, and status
- Update tasks including status and assignment to other users
- Delete tasks
- Role-based access control (Admin, Manager, Regular User)
- JWT token-based authentication
## Deploying from GitHub

This guide outlines the steps to deploy an Task Guardian application from a GitHub repository.

### Prerequisites

Before you begin, ensure that you have the following:

- Node.js installed on your deployment environment
- Git installed on your deployment environment


### Steps

1. **Clone Repository**: Clone the GitHub repository containing your Express.js application to your deployment environment.

   ```bash
   git clone https://github.com/darkdeathoriginal/taskguardian.git
   ```

2. **Install Dependencies**: Navigate to the cloned directory and install the dependencies using npm.

```bash
cd taskguardian
npm install
```
3. **Configure Environment Variables**: Set up environment variables required for your application. 
- `PORT`
-  `MONGODB_URI`
-  `JWT_SECRET`
- `SITE_URL`

4. **Start the Server**: Run the command to start your Task Guardian server.

```bash
npm start
```

## Deployment from docker
This guide outlines the steps to deploy the Task Guardian application from a Docker image hosted on a Docker registry.

### Prerequisites

Before you begin, ensure that you have Docker installed on your deployment environment.

### Steps

1. **Pull Docker Image**: Pull the Task Guardian Docker image from the Docker registry.

   ```bash
   docker pull anwinsharon/taskguardian:0.1.0
   ```

2. **Run Docker Container**: Once the Docker image is pulled, run a Docker container using the following command.
```bash
docker run -e PORT=$PORT -e MONGODB_URI=$MONGODB_URI -e JWT_SECRET=$JWT_SECRET -e SITE_URL=$SITE_URL -p 3000:3000 anwinsharon/taskguardian:0.1.0
```

Replace `$PORT` and other variables with you own values.


## Documentation

[Documentation](https://taskguardian.vercel.app/)


## Images

![Screenshot1](https://github.com/darkdeathoriginal/taskguardian/blob/main/images/1.png?raw=true)

![Screenshot1](https://github.com/darkdeathoriginal/taskguardian/blob/main/images/2.png?raw=true)

![Screenshot1](https://github.com/darkdeathoriginal/taskguardian/blob/main/images/3.png?raw=true)