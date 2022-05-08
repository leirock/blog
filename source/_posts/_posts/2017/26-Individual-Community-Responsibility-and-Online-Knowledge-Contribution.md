---
title: Individual Community Responsibility and Online Knowledge Contribution
categories: [观点]
tags: [经济, 互联网]
mathjax: true
pid: 26
date: 2017-11-21 18:30:01
---

This is a small research proposal about individual community responsibility and online knowledge contribution.

## 1. Motivation

As more and more involved in the online community, people begin to have belongingness to a particular online community. In order to maintain the specific environment and culture of the communities, some users begin to participate in the self-management of online communities, which is what we call individual community responsibility. Examples of such voluntary work include being the role of administrator, taking part in creating regulations, reporting abusive contents or spams, etc. 
<!--more-->

Knowledge sharing communities such as Quora and Zhihu attach great importance to user-generated content (UGC) by active users. An online community user who participates in such self-management work is a natural active user. So are these enthusiastic users also important content contributors? Maybe right but the mechanism between one’s community responsibility and its content contribution is not clear. Our research focuses on two questions: Does greater individual community responsibility lead to individual’s contribution to that platform? How can individual community responsibility influence user’s contribution? 

Our study will provide some managerial implications for online knowledge sharing communities. Because based on our proposed results, higher individual community responsibility can positively lead to more knowledge contribution, online knowledge sharing communities may motivate user’s knowledge contribution by providing user higher individual community responsibility. In this case, platforms may maintain or increase the average contribution level and achieve their sustainable development.

## 2. Data

We use the dataset from Zhihu, the biggest Chinese online question-and-answer platform, as our main data source. The dataset contains user information and user behavior. The user information consists of user’s personal characteristics and social network. The user behavior contains three parts. The first is user contribution, including the questions asked by the user, answers, contribution to personal column, consumption of Zhihu Bookstore and Zhihu Live. The second is user participation, including comments, upvotes, favorites, invitations and thanks to an answer. The third is individual community responsibility, which contains the public edits of the user, the reports of answers that go against the rules of Zhihu, and contributions to “Zhihu Topics” (a special topic about Zhihu platform).

## 3. Regression Analysis

In our basic regression specification, each user’s individual community responsibility is measured by the number of public edits. User’s online contribution is measured by the number of answers. Then, we will modify the measurements of both individual community responsibility and online knowledge contribution to more precise measurements. For individual community responsibility, there will be potential bias when we only consider the number of public edits. So several public edits to one question during a very short time period will be merged into a single public edit. For online knowledge contribution, we will take the influence of each answer into consideration by giving different weight to each answer based on the number of upvotes and downvotes, number of favorites and number of thanks.

To control the potential endogeneity of our explanatory variable, we put some additional variables into the basic specification. First, we add incentives into our regression model because incentives such as invitation to answer, upvotes and thanks can have a strong correlation with online contribution. People may choose to answer a question because of other users’ invitations, upvotes and thanks received in other answers. Second, we add variables representing each individual’s social network to control for the endogeneity of peer effects (number of followers/followings, number of follower’s followers, etc.). Third, we also incorporate hot topics of a given time to control possible endogeneity of trends. Therefore, the model is

$$Contribution_{it}=\beta_0+\beta_1PublicEdit_{it}+\beta_2Incentive_{it}+\beta_3SocialNetwork_{it}+\beta_4HotTopic_t+ControlVars_{it}+\varepsilon_{it}$$

We also use another measurement of individual community responsibility to provide a robustness check of our basic model. Responsible users of Zhihu may report abusive contents or spams to help maintain the community environment. These report information, including the number of reports and percentage of successful reports, can be used as a new measurement of individual community responsibility, thus providing a robustness check of our results.

Granger causality test may be used to rule out the possibility of reverse causality if the time stampings of observations are available.
