registry = gcr.io/fresh-balancer-194720
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
	kubectl expose deployment/lightandfun-back --type="NodePort" --target-port 8080

# Clean containers and restart.
run-clean:
	kubectl delete service lightandfun-back
	kubectl delete deployment lightandfun-back
