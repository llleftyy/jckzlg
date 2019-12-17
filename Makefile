build:
	@node ./build.js
deploy:
	AWS_PROFILE=admin aws s3 sync --delete public/ s3://www.jckzlg.com
serve:
	@./watch.sh >/dev/null &
	@serve public
     
