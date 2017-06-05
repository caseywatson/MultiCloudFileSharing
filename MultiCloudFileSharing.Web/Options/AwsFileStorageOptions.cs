namespace MultiCloudFileSharing.Web.Options
{
    public class AwsFileStorageOptions
    {
        public string AwsAccessKeyId { get; set; }
        public string AwsSecretAccessKey { get; set; }
        public string FileBucketName { get; set; }
        public string RegionName { get; set; }
    }
}
