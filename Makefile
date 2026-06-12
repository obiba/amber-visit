build:
	docker build -t amber-visit:snapshot .

run:
	docker run -p 3070:80 \
		-e AMBER_URL=http://localhost:3030 \
		-e RECAPTCHA_SITE_KEY='' \
		-e PATH_PREFIX='/' \
		amber-visit:snapshot

clean:
	docker rm $(docker ps -a -q --filter ancestor=amber-visit:snapshot) || true
	docker rmi amber-visit:snapshot || true