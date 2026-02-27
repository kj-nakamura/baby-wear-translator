import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import * as docker from "@pulumi/docker";

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

// レジストリのURLを組み立て (repository.project を使うと確実です)
const repositoryUrl = pulumi.interpolate`${region}-docker.pkg.dev/${repository.project}/${repository.repositoryId}`;

// --- ここから追加部分 ---

// 1. Goバックエンドのビルドとプッシュ
const recommenderServiceImage = new docker.Image("go-recommender-service-img", {
    imageName: pulumi.interpolate`${repositoryUrl}/go-recommender-service:latest`,
    build: {
        // GoのコードとDockerfileがあるディレクトリへの相対パスを指定してください
        context: "../apps/recommender-service",
        platform: "linux/amd64", // Cloud Run用に明示的に指定
    },
});

// バックエンドのCloud Runデプロイ
const recommenderService = new gcp.cloudrun.Service("baby-wear-backend", {
    location: region,
    template: {
        spec: {
            containers: [{
                image: recommenderServiceImage.imageName,
                ports: [{ containerPort: 8080 }],
                envs: [
                    { name: "ALLOWED_ORIGINS", value: "*" }, // シンプル化のため一旦全て許可
                ],
            }],
        },
    },
});

// バックエンドの公開設定
const recommenderServiceIam = new gcp.cloudrun.IamMember("recommender-service-public-access", {
    service: recommenderService.name,
    location: region,
    role: "roles/run.invoker",
    member: "allUsers",
});

// 2. TypeScriptフロントエンドのビルドとプッシュ
const frontendImage = new docker.Image("ts-frontend-img", {
    imageName: pulumi.interpolate`${repositoryUrl}/ts-frontend:latest`,
    build: {
        context: "../apps/frontend",
        platform: "linux/amd64",
    },
});

// フロントエンドのCloud Runデプロイ
const frontendService = new gcp.cloudrun.Service("baby-wear-frontend", {
    location: region,
    template: {
        spec: {
            containers: [{
                image: frontendImage.imageName,
                ports: [{ containerPort: 3000 }], // DockerfileのEXPOSE 3000に合わせる
                envs: [
                    { 
                        name: "BACKEND_API_URL", 
                        value: recommenderService.statuses.apply(s => s[0].url) 
                    },
                ],
            }],
        },
    },
});

// フロントエンドの公開設定
const frontendIam = new gcp.cloudrun.IamMember("frontend-public-access", {
    service: frontendService.name,
    location: region,
    role: "roles/run.invoker",
    member: "allUsers",
});

// Export the URLs
export const bucketName = bucket.url;
export const repoUrl = repositoryUrl;
export const recommenderServiceUrl = recommenderService.statuses.apply(s => s[0].url);
export const frontendUrl = frontendService.statuses.apply(s => s[0].url);