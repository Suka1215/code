import json
import os
import uuid
import boto3
from urllib.parse import urlparse
import logging
from botocore.client import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)
S3 = boto3.resource('s3')

def processUploadedMedia(event, context):
    assetID = str(uuid.uuid4())
    sourceS3Bucket = event['Records'][0]['s3']['bucket']['name']
    sourceS3Key = event['Records'][0]['s3']['object']['key']
    sourceS3 = 's3://' + sourceS3Bucket + '/' + sourceS3Key
    lessonTopic = sourceS3Key.split("/")[1]
    destinationS3 = 's3://' + \
        os.environ['DESTINATION_BUCKET'] + '/' + \
        os.environ['DESTINATION_PREFIX']
    mediaConvertRole = os.environ['MEDIA_CONVERT_ROLE']
    application = os.environ['APPLICATION']
    region = os.environ['REGION']
    statusCode = 200
    jobs = []
    job = {}

    jobMetadata = {}
    jobMetadata['assetID'] = assetID
    jobMetadata['application'] = application
    jobMetadata['input'] = sourceS3

    try:
        jobInput = {}

        with open('job.json') as json_data:
            jobInput['filename'] = 'deliverable'
            logger.info('jobInput: %s', jobInput['filename'])
            jobInput['settings'] = json.load(json_data)
            logger.info(json.dumps(jobInput['settings']))
            jobs.append(jobInput)
            mediaConvertClient = boto3.client(
                'mediaconvert', region_name=region)
            endpoints = mediaConvertClient.describe_endpoints()
            client = boto3.client('mediaconvert', region_name=region,
                                  endpoint_url=endpoints['Endpoints'][0]['Url'], verify=False)
                                  
            for j in jobs:
                jobSettings = j['settings']
                jobFilename = j['filename']

                jobMetadata['settings'] = jobFilename

                jobSettings['Inputs'][0]['FileInput'] = sourceS3

                destinationS3 = 's3://' + os.environ['DESTINATION_BUCKET'] + '/' \
                    + os.environ['DESTINATION_PREFIX'] + '/' \
                    + lessonTopic + '/' \
                    + os.path.splitext(os.path.basename(sourceS3Key))[0] + '/' \
                    + os.path.splitext(os.path.basename(jobFilename))[0]

                for outputGroup in jobSettings['OutputGroups']:

                    logger.info("outputGroup['OutputGroupSettings']['Type'] == %s",
                                outputGroup['OutputGroupSettings']['Type'])

                    if outputGroup['OutputGroupSettings']['Type'] == 'FILE_GROUP_SETTINGS':
                        templateDestination = outputGroup['OutputGroupSettings']['FileGroupSettings']['Destination']
                        templateDestinationKey = urlparse(
                            templateDestination).path
                        logger.info("templateDestinationKey == %s",
                                    templateDestinationKey)
                        outputGroup['OutputGroupSettings']['FileGroupSettings']['Destination'] = destinationS3 + \
                            templateDestinationKey

                    elif outputGroup['OutputGroupSettings']['Type'] == 'HLS_GROUP_SETTINGS':
                        templateDestination = outputGroup['OutputGroupSettings']['HlsGroupSettings']['Destination']
                        templateDestinationKey = urlparse(
                            templateDestination).path
                        logger.info("templateDestinationKey == %s",
                                    templateDestinationKey)
                        outputGroup['OutputGroupSettings']['HlsGroupSettings']['Destination'] = destinationS3 + \
                            templateDestinationKey
                    else:
                        logger.error("Exception: Unknown Output Group Type %s",
                                     outputGroup['OutputGroupSettings']['Type'])
                        statusCode = 500

                logger.info(json.dumps(jobSettings))

                job = client.create_job(
                    Role=mediaConvertRole, UserMetadata=jobMetadata, Settings=jobSettings)

    except Exception as e:
        logger.error('Exception: %s', e)
        statusCode = 500
        raise

    finally:
        return {
            'statusCode': statusCode,
            'body': json.dumps(job, indent=4, sort_keys=True, default=str),
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'}
        }
