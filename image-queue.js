function ImageQueue()
{
    var closedRequests = {},
        queueList = [],
        queueByHref = {},
        numOpenRequests = 0,
        openRequests = {};
    
    function addImage(href, onload)
    {
        var request = {href: href, onloaded: onload};
        
        queueList.push(request);
        queueByHref[request.href] = request;
    }

    function cancelLoad(href)
    {
        // If the request is open, close it.

        if(href in openRequests)
        {
            // If the image is not yet loaded, prevent it from loading.

            if(closedRequests[href] == undefined)
            {
                openRequests[href].img.onload = function() {};
                openRequests[href].img.onerror = function() {};
                openRequests[href].img.src = "about:";
                openRequests[href].img = null;
            }
            
            delete openRequests[href];
            numOpenRequests--;
        }

        // Mark the image null in the queue so it will be skipped.

        if(href in queueByHref)
        {
            // get the href out of the queue completely
            queueList = queueList.filter(function(req) { return req.href != href });
            delete queueByHref[href];
        }
    }
    
    function prioritizeQueue(pattern)
    {
        var sortFunction = function(r1, r2)
        {
            return Number(Boolean(r2.href.match(pattern))) - Number(Boolean(r1.href.match(pattern)));
        }
    
        queueList.sort(sortFunction);
    }

   /**
    * Request up to 4 things from the queue, skipping blank items.
    */
    function processQueue()
    {
        while(numOpenRequests < 4 && queueList.length > 0)
        {
            var request = queueList.shift();

            if(request.href && request.href in queueByHref)
            {
                loadImage(request);
                openRequests[request.href] = request; 
                numOpenRequests++;
            }

            delete queueByHref[request.href];                        
        }
    }
    
    function loadImage(request)
    {
        request.img = new Image();            

        request.img.onload = function()
        {
            request.onloaded(undefined, request.img);
            closedRequests[request.href] = Date.now();
            cancelLoad(request.href);
        }

        request.img.onerror = function(error)
        {
            request.onloaded(error, request.img);
            closedRequests[request.href] = Date.now();
            cancelLoad(request.href);
        }

        request.img.src = request.href;
    }

    return {add: addImage, cancel: cancelLoad, process: processQueue, prioritize: prioritizeQueue};
};