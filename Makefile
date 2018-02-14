registry = gcr.io/fresh-balancer-194720/
imagename = $(registry)/lightandfun-back
git_hash = $(shell git rev-parse --short HEAD)

docker_exec = docker exec -ti chatbot_chatbot_1
docker_exec_non_tty = docker exec -i chatbot_chatbot_1

# Build docker image.
build:
	docker build -t $(imagename):dev .
	docker build -t $(imagename):$(git_hash) .

# Publish docker image to repository.
publish:
	docker tag $(imagename):dev $(imagename):$(git_hash)
	gcloud docker -- push $(imagename):dev
	gcloud docker -- push $(imagename):$(git_hash)

# Run online web with Docker compose.
run:
	kubectl config use-context docker-for-desktop
	kubectl run lightandfun-back --image=$(imagename):dev --port=8080
	kubectl expose deployment/lightandfun-back --type="NodePort" --port 8080
	export NODE_PORT=$(kubectl get services/lightandfun-back -o go-template='{{(index .spec.ports 0).nodePort}}')
	echo NODE_PORT=$NODE_PORT

# Clean containers and restart.
run-clean:
	kubectl delete service lightandfun-back
	kubectl delete deployment lightandfun-back 

stop:
	docker-compose stop

# Connect to container with bash.
shell:
	$(docker_exec) /bin/bash

# Connect to container with Django manage.py runserver.
run-dev:
	$(docker_exec) python manage.py runserver 0.0.0.0:8800
