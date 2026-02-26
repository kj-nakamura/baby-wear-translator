import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

const config = new pulumi.Config();
const region = gcp.config.region || "asia-northeast1";

// Create a GCP resource (Storage Bucket)
const bucket = new gcp.storage.Bucket("assets-bucket", {
    location: region,
    forceDestroy: true, // For development purposes
});

// Artifact Registry to store Docker images for our services
const repository = new gcp.artifactregistry.Repository("app-repo", {
    format: "DOCKER",
    location: region,
    repositoryId: "baby-wear-translator",
    description: "Docker repository for Baby Wear Translator services",
});

// Export the bucket URL and repository URL
export const bucketName = bucket.url;
export const repositoryUrl = pulumi.interpolate`${region}-docker.pkg.dev/${gcp.config.project}/${repository.repositoryId}`;

