wget $1 --progress=dot -q --show-progress 2>&1 | awk 'NF>2 && $(NF-2) ~ /%/{
        cmd = "/home/brad/automate/beetle/set_percentage.sh " $(NF-2)
	system(cmd); 
        printf "\r %s",$(NF-2)} 
	END{
	    print "\r "	
	}'
