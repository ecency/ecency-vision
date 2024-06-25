import { catchPostImage, renderPostBody } from "@ecency/render-helper";
import { connect } from "react-redux";
import React from "react";

interface MatchParams {
  id: string;
}

interface DetailProps extends PageProps {
  match: match<MatchParams>;
}

interface DetailState {
  loading: boolean;
  proposal: Proposal | null;
  entry: Entry | null;
}

class ProposalDetailPage extends BaseComponent<DetailProps, DetailState> {
  state: DetailState = {
    loading: true,
    proposal: null,
    entry: null
  };

  componentDidMount() {
    this.load();
  }

  load = () => {
    const { match } = this.props;
    const proposalId = Number(match.params.id);

    this.stateSet({ loading: true });
    findProposals(proposalId)
      .then((proposal) => {
        if (
          new Date(proposal.start_date) < new Date() &&
          new Date(proposal.end_date) >= new Date()
        ) {
          proposal.status = "active";
        } else if (new Date(proposal.end_date) < new Date()) {
          proposal.status = "expired";
        } else {
          proposal.status = "inactive";
        }
        if (proposal) {
          this.stateSet({ proposal });
          return getPost(proposal.creator, proposal.permlink);
        }
        return null;
      })
      .then((entry) => {
        if (entry) {
          this.stateSet({ entry });
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { global } = this.props;
    const { loading, proposal, entry } = this.state;

    if (loading) {
      return (
        <>
          <NavBar history={this.props.history} />
          <LinearProgress />
        </>
      );
    }

    if (!proposal || !entry) {
      return NotFound({ ...this.props });
    }

    const renderedBody = { __html: renderPostBody(entry.body, false, global.canUseWebp) };

    //  Meta config
    const metaProps = {
      title: `${_t("proposals.page-title")} | ${proposal.subject}`,
      description: `${proposal.subject} by @${proposal.creator}`,
      url: `/proposals/${proposal.id}`,
      canonical: `/proposals/${proposal.id}`,
      published: parseDate(entry.created).toISOString(),
      modified: parseDate(entry.updated).toISOString(),
      image: catchPostImage(entry.body, 600, 500, global.canUseWebp ? "webp" : "match")
    };

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        <NavBar history={this.props.history} />
        <div className="app-content proposals-page proposals-detail-page">
          <div className="page-header mt-5">
            <h1 className="header-title">{_t("proposals.page-title")}</h1>
            <p className="see-all">
              <Link to="/proposals">{_t("proposals.see-all")}</Link>
            </p>
          </div>
          <div className="proposal-list">
            <Link to="/proposals" className="btn-dismiss">
              {closeSvg}
            </Link>
            {ProposalListItem({
              ...this.props,
              proposal
            })}
          </div>
          <div className="the-entry">
            <div
              className="entry-body markdown-view user-selectable"
              dangerouslySetInnerHTML={renderedBody}
            />
          </div>
        </div>
      </>
    );
  }
}

export const ProposalDetailContainer = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(ProposalDetailPage);
