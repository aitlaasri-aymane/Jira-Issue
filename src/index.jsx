import ForgeUI, {
  render,
  Fragment,
  Text,
  Button,
  Form,
  TextField,
  IssuePanel,
  DatePicker,
  useProductContext,
  useState,
} from "@forge/ui";
import { properties } from "@forge/api";

const getStorageData = async (issueKey, storageKey) =>
  await properties.onJiraIssue(issueKey).get(storageKey);
const getProjectStorageData = async (projectKey, storageKey) =>
  await properties.onJiraProject(projectKey).get(storageKey);
const setStorageData = async (issueKey, storageKey, value) =>
  await properties.onJiraIssue(issueKey).set(storageKey, value);
const setProjectStorageData = async (projectKey, storageKey, value) =>
  await properties.onJiraProject(projectKey).set(storageKey, value);
const deleteStorageData = async (issueKey, storageKey) =>
  await properties.onJiraIssue(issueKey).delete(storageKey);

const fetchIssueProgress = async (
  issueKey,
  storageKey,
  projectKey,
  projectStorageKey
) => {
  const data = await getStorageData(issueKey, storageKey);
  console.log(data);
  const projectdata = await getProjectStorageData(
    projectKey,
    projectStorageKey
  );
  console.log(projectdata);
  return data;
};

const App = () => {
  const context = useProductContext();
  const [issueProgress, setIssueProgress] = useState(
    async () =>
      await fetchIssueProgress(
        context.platformContext.issueKey,
        "IssueProgress",
        context.platformContext.projectKey,
        "ProjectProgress"
      )
  );

  const deleteIssueProgress = async () => {
    const issueProgress = await getStorageData(
      context.platformContext.issueKey,
      "IssueProgress"
    );
    const projectProgress = await getProjectStorageData(
      context.platformContext.projectKey,
      "ProjectProgress"
    );
    deleteStorageData(context.platformContext.issueKey, "IssueProgress")
      .then(
        setProjectStorageData(
          context.platformContext.projectKey,
          "ProjectProgress",
          projectProgress - issueProgress
        )
      )
      .then(setIssueProgress(null));
  };

  const onSubmit = async (formData) => {
    const progress = +formData.progress;
    const projectProgress = await getProjectStorageData(
      context.platformContext.projectKey,
      "ProjectProgress"
    );
    //if (projectProgress === undefined) projectProgress = 0;
    console.log(progress, typeof progress);
    console.log(projectProgress, typeof projectProgress);
    setStorageData(context.platformContext.issueKey, "IssueProgress", progress)
      .then(
        setProjectStorageData(
          context.platformContext.projectKey,
          "ProjectProgress",
          progress + (projectProgress === undefined ? 0 : projectProgress)
        )
      )
      .then(setIssueProgress(progress))
      .then(console.log(issueProgress, progress, projectProgress));
  };

  return (
    <Fragment>
      {issueProgress ? (
        <Fragment>
          <Text>Issue progress: {issueProgress}</Text>
          <Button text="Change Issue Time" onClick={deleteIssueProgress} />
        </Fragment>
      ) : (
        <Fragment>
          <Form onSubmit={onSubmit}>
            <TextField
              label="Progress"
              placeholder="Progress time"
              name="progress"
              type="number"
              isRequired
            />
            {/* <DatePicker
              name="date"
              label="Time Log Date"
              description="Date at which you want to log time"
            /> */}
          </Form>
        </Fragment>
      )}
    </Fragment>
  );
};

export const run = render(
  <IssuePanel>
    <App />
  </IssuePanel>
);
